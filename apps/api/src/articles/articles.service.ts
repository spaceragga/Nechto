import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  ARTICLE_BODY_MIN_PUBLISH,
  canPublishArticle,
  type Article,
  type ArticleSummary,
  type CreateArticleFields,
  type CursorPage,
  type CursorPageQuery,
  type PublicArticle,
  type UpdateArticleFields,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';
import { publishedProfileWhere } from '../profiles/published-profile';
import { StorageService } from '../storage/storage.service';
import {
  toArticleSummary,
  toArticleView,
  toPublicArticle,
  type ArticleRecord,
  type ArticleWithProfileRecord,
} from './article.mapper';

const coverInclude = {
  coverWork: { select: { imageKey: true } },
} as const;

const publishedAuthorSelect = {
  slug: true,
  displayName: true,
  avatarKey: true,
  directions: true,
} as const;

const publishedWhere = {
  publishedAt: { not: null },
  hidden: false,
  profile: publishedProfileWhere,
} as const;

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async listMine(
    userId: string,
    query: CursorPageQuery,
  ): Promise<CursorPage<Article>> {
    const profile = await this.requireProfile(userId);
    const rows = await this.prisma.article.findMany({
      where: { profileId: profile.id },
      orderBy: { id: 'desc' },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: coverInclude,
    });
    return this.pageMine(rows, query.limit);
  }

  async getMine(userId: string, articleId: string): Promise<Article> {
    const article = await this.requireOwned(userId, articleId);
    return toArticleView(article, this.storage);
  }

  async listPublished(
    query: CursorPageQuery,
  ): Promise<CursorPage<ArticleSummary>> {
    const rows = await this.prisma.article.findMany({
      where: publishedWhere,
      orderBy: [
        { featuredAt: { sort: 'desc', nulls: 'last' } },
        { publishedAt: 'desc' },
        { id: 'desc' },
      ],
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: {
        ...coverInclude,
        profile: { select: publishedAuthorSelect },
      },
    });
    return this.pagePublished(rows, query.limit);
  }

  async listPublishedBySlug(
    slug: string,
    query: CursorPageQuery,
  ): Promise<CursorPage<ArticleSummary>> {
    const profile = await this.prisma.profile.findFirst({
      where: { ...publishedProfileWhere, slug },
      select: { id: true, ...publishedAuthorSelect },
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }

    const { id: profileId, ...author } = profile;
    const rows = await this.prisma.article.findMany({
      where: {
        profileId,
        publishedAt: { not: null },
        hidden: false,
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: coverInclude,
    });

    return this.pagePublished(
      rows.map((row) => ({ ...row, profile: author })),
      query.limit,
    );
  }

  async getPublishedById(id: string): Promise<PublicArticle> {
    const article = await this.prisma.article.findFirst({
      where: { id, ...publishedWhere },
      include: {
        ...coverInclude,
        profile: { select: publishedAuthorSelect },
      },
    });
    if (!article) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.ARTICLE_NOT_FOUND,
        'Article not found',
      );
    }
    return toPublicArticle(article, this.storage);
  }

  async listForCuration(): Promise<ArticleSummary[]> {
    const rows = await this.prisma.article.findMany({
      where: publishedWhere,
      orderBy: [
        { featuredAt: { sort: 'desc', nulls: 'last' } },
        { publishedAt: 'desc' },
      ],
      take: 30,
      include: {
        ...coverInclude,
        profile: { select: publishedAuthorSelect },
      },
    });
    return rows.map((row) => toArticleSummary(row, this.storage));
  }

  async listHidden(): Promise<ArticleSummary[]> {
    const rows = await this.prisma.article.findMany({
      where: {
        hidden: true,
        publishedAt: { not: null },
        profile: publishedProfileWhere,
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        ...coverInclude,
        profile: { select: publishedAuthorSelect },
      },
    });
    return rows.map((row) => toArticleSummary(row, this.storage));
  }

  async createMine(
    userId: string,
    fields: CreateArticleFields,
  ): Promise<Article> {
    const profile = await this.requireProfile(userId);
    await this.assertCoverWork(profile.id, fields.coverWorkId ?? null);
    const created = await this.prisma.article.create({
      data: {
        profileId: profile.id,
        title: fields.title,
        lede: fields.lede,
        body: fields.body,
        coverWorkId: fields.coverWorkId ?? null,
      },
      include: coverInclude,
    });
    return toArticleView(created, this.storage);
  }

  async updateMine(
    userId: string,
    articleId: string,
    fields: UpdateArticleFields,
  ): Promise<Article> {
    const existing = await this.requireOwned(userId, articleId);
    if (fields.coverWorkId !== undefined) {
      await this.assertCoverWork(existing.profileId, fields.coverWorkId);
    }
    const updated = await this.prisma.article.update({
      where: { id: articleId },
      data: {
        ...(fields.title !== undefined ? { title: fields.title } : {}),
        ...(fields.lede !== undefined ? { lede: fields.lede } : {}),
        ...(fields.body !== undefined ? { body: fields.body } : {}),
        ...(fields.coverWorkId !== undefined
          ? { coverWorkId: fields.coverWorkId }
          : {}),
      },
      include: coverInclude,
    });
    return toArticleView(updated, this.storage);
  }

  async publishMine(userId: string, articleId: string): Promise<Article> {
    const profile = await this.requireProfile(userId);
    const article = await this.requireOwned(userId, articleId);
    if (
      !canPublishArticle({
        title: article.title,
        body: article.body,
        profilePublished: Boolean(profile.publishedAt),
      })
    ) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.ARTICLE_PUBLISH_REQUIREMENTS_NOT_MET,
        `Article needs a published profile and at least ${ARTICLE_BODY_MIN_PUBLISH} characters of body`,
      );
    }
    const updated = await this.prisma.article.update({
      where: { id: articleId },
      data: { publishedAt: article.publishedAt ?? new Date(), hidden: false },
      include: coverInclude,
    });
    return toArticleView(updated, this.storage);
  }

  async unpublishMine(userId: string, articleId: string): Promise<Article> {
    await this.requireOwned(userId, articleId);
    const updated = await this.prisma.article.update({
      where: { id: articleId },
      data: { publishedAt: null, featuredAt: null },
      include: coverInclude,
    });
    return toArticleView(updated, this.storage);
  }

  async deleteMine(userId: string, articleId: string): Promise<void> {
    await this.requireOwned(userId, articleId);
    await this.prisma.article.delete({ where: { id: articleId } });
  }

  async feature(articleId: string): Promise<ArticleSummary> {
    const article = await this.prisma.article.findFirst({
      where: { id: articleId, ...publishedWhere },
      include: {
        ...coverInclude,
        profile: { select: publishedAuthorSelect },
      },
    });
    if (!article) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.ARTICLE_NOT_FOUND,
        'Article not found',
      );
    }
    await this.prisma.$transaction([
      this.prisma.article.updateMany({
        where: { featuredAt: { not: null } },
        data: { featuredAt: null },
      }),
      this.prisma.article.update({
        where: { id: articleId },
        data: { featuredAt: new Date() },
      }),
    ]);
    const featured = await this.prisma.article.findUniqueOrThrow({
      where: { id: articleId },
      include: {
        ...coverInclude,
        profile: { select: publishedAuthorSelect },
      },
    });
    return toArticleSummary(featured, this.storage);
  }

  async unfeature(articleId: string): Promise<ArticleSummary> {
    const article = await this.prisma.article.findFirst({
      where: { id: articleId, publishedAt: { not: null }, hidden: false },
      include: {
        ...coverInclude,
        profile: { select: publishedAuthorSelect },
      },
    });
    if (!article) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.ARTICLE_NOT_FOUND,
        'Article not found',
      );
    }
    const updated = await this.prisma.article.update({
      where: { id: articleId },
      data: { featuredAt: null },
      include: {
        ...coverInclude,
        profile: { select: publishedAuthorSelect },
      },
    });
    return toArticleSummary(updated, this.storage);
  }

  async hide(articleId: string): Promise<ArticleSummary> {
    return this.setHidden(articleId, true);
  }

  async unhide(articleId: string): Promise<ArticleSummary> {
    return this.setHidden(articleId, false);
  }

  private async setHidden(
    articleId: string,
    hidden: boolean,
  ): Promise<ArticleSummary> {
    const article = await this.prisma.article.findFirst({
      where: { id: articleId, publishedAt: { not: null } },
      include: {
        ...coverInclude,
        profile: { select: publishedAuthorSelect },
      },
    });
    if (!article) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.ARTICLE_NOT_FOUND,
        'Article not found',
      );
    }
    const updated = await this.prisma.article.update({
      where: { id: articleId },
      data: {
        hidden,
        ...(hidden ? { featuredAt: null } : {}),
      },
      include: {
        ...coverInclude,
        profile: { select: publishedAuthorSelect },
      },
    });
    return toArticleSummary(updated, this.storage);
  }

  private async requireProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true, publishedAt: true },
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
    return profile;
  }

  private async requireOwned(
    userId: string,
    articleId: string,
  ): Promise<ArticleRecord & { profileId: string }> {
    const profile = await this.requireProfile(userId);
    const article = await this.prisma.article.findFirst({
      where: { id: articleId, profileId: profile.id },
      include: coverInclude,
    });
    if (!article) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.ARTICLE_NOT_FOUND,
        'Article not found',
      );
    }
    return article;
  }

  private async assertCoverWork(
    profileId: string,
    coverWorkId: string | null,
  ): Promise<void> {
    if (!coverWorkId) {
      return;
    }
    const work = await this.prisma.work.findFirst({
      where: { id: coverWorkId, profileId },
      select: { id: true },
    });
    if (!work) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.WORK_NOT_FOUND,
        'Cover work not found',
      );
    }
  }

  private pageMine(rows: ArticleRecord[], limit: number): CursorPage<Article> {
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: items.map((row) => toArticleView(row, this.storage)),
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    };
  }

  private pagePublished(
    rows: ArticleWithProfileRecord[],
    limit: number,
  ): CursorPage<ArticleSummary> {
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: items.map((row) => toArticleSummary(row, this.storage)),
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    };
  }
}
