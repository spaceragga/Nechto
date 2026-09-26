import type {
  Article,
  ArticleSummary,
  PublicArticle,
} from '@nechto/api-contract';
import {
  CREATOR_DIRECTIONS,
  type CreatorDirection,
} from '@nechto/api-contract';
import type { StorageService } from '../storage/storage.service';

const directionSet = new Set<string>(CREATOR_DIRECTIONS);

function toDirections(values: string[]): CreatorDirection[] {
  return values.filter((value): value is CreatorDirection =>
    directionSet.has(value),
  );
}

export type ArticleRecord = {
  id: string;
  title: string;
  lede: string;
  body: string;
  coverWorkId: string | null;
  publishedAt: Date | null;
  featuredAt: Date | null;
  hidden: boolean;
  createdAt: Date;
  coverWork: { imageKey: string } | null;
};

export type ArticleWithProfileRecord = ArticleRecord & {
  profile: {
    slug: string | null;
    displayName: string | null;
    avatarKey: string | null;
    directions: string[];
  };
};

function coverUrl(
  article: ArticleRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): string | null {
  return article.coverWork
    ? storage.getPublicUrl(article.coverWork.imageKey)
    : null;
}

function toAuthor(
  profile: ArticleWithProfileRecord['profile'],
  storage: Pick<StorageService, 'getPublicUrl'>,
) {
  return {
    slug: profile.slug ?? '',
    displayName: profile.displayName ?? profile.slug ?? '',
    avatarUrl: profile.avatarKey
      ? storage.getPublicUrl(profile.avatarKey)
      : null,
    directions: toDirections(profile.directions),
  };
}

export function toArticleView(
  article: ArticleRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): Article {
  return {
    id: article.id,
    title: article.title,
    lede: article.lede,
    body: article.body,
    coverImageUrl: coverUrl(article, storage),
    coverWorkId: article.coverWorkId,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    featuredAt: article.featuredAt?.toISOString() ?? null,
    hidden: article.hidden,
    createdAt: article.createdAt.toISOString(),
  };
}

export function toArticleSummary(
  article: ArticleWithProfileRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): ArticleSummary {
  return {
    id: article.id,
    title: article.title,
    lede: article.lede,
    coverImageUrl: coverUrl(article, storage),
    publishedAt: article.publishedAt!.toISOString(),
    featuredAt: article.featuredAt?.toISOString() ?? null,
    author: toAuthor(article.profile, storage),
  };
}

export function toPublicArticle(
  article: ArticleWithProfileRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): PublicArticle {
  return {
    ...toArticleSummary(article, storage),
    body: article.body,
  };
}
