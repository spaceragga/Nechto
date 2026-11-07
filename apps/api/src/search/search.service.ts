import { Injectable } from '@nestjs/common';
import type {
  ArticleSummary,
  DialogueSummary,
  ProjectSummary,
  PublicProfileWithWorks,
  SearchQuery,
  SearchResults,
  StudioProfileSummary,
  WorkWithAuthor,
} from '@nechto/api-contract';
import { toArticleSummary } from '../articles/article.mapper';
import { toDialogueSummary } from '../dialogues/dialogue.mapper';
import { PrismaService } from '../prisma/prisma.service';
import {
  profileInclude,
  toPublicProfile,
  toProfileRecord,
} from '../profiles/profile.mapper';
import { publishedProfileWhere } from '../profiles/published-profile';
import { toProjectSummary } from '../projects/project.mapper';
import { StorageService } from '../storage/storage.service';
import { toStudioProfileSummary } from '../studio/studio.mapper';
import { toWorkView, toWorkWithAuthorView } from '../works/work.mapper';

const publishedAuthorSelect = {
  slug: true,
  displayName: true,
  avatarKey: true,
  directions: true,
} as const;

const projectInclude = {
  blocks: {
    orderBy: { position: 'asc' as const },
    include: { work: true },
  },
} as const;

const workAuthorInclude = {
  profile: {
    select: {
      slug: true,
      displayName: true,
      avatarKey: true,
      directions: true,
      publishedAt: true,
    },
  },
} as const;

const dialogueInclude = {
  leftWork: { include: workAuthorInclude },
  rightWork: { include: workAuthorInclude },
} as const;

const emptyResults = (q: string): SearchResults => ({
  q,
  works: [],
  creators: [],
  projects: [],
  articles: [],
  dialogues: [],
  studios: [],
});

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async search(query: SearchQuery): Promise<SearchResults> {
    const q = query.q.trim();
    if (q.length < 2) {
      return emptyResults(q);
    }

    const titleMatch = { contains: q, mode: 'insensitive' as const };

    const [
      workRows,
      creatorRows,
      projectRows,
      articleRows,
      dialogueRows,
      studioRows,
    ] = await Promise.all([
      this.prisma.work.findMany({
        where: {
          hidden: false,
          profile: publishedProfileWhere,
          title: titleMatch,
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        include: { profile: { select: publishedAuthorSelect } },
      }),
      this.prisma.profile.findMany({
        where: {
          AND: [
            publishedProfileWhere,
            {
              OR: [{ displayName: titleMatch }, { slug: titleMatch }],
            },
          ],
        },
        orderBy: { publishedAt: 'desc' },
        take: query.limit,
        include: {
          ...profileInclude,
          works: {
            where: { hidden: false },
            orderBy: { id: 'desc' },
            take: 4,
          },
        },
      }),
      this.prisma.project.findMany({
        where: {
          hidden: false,
          profile: publishedProfileWhere,
          blocks: { some: { kind: 'image' } },
          title: titleMatch,
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        include: {
          ...projectInclude,
          profile: { select: publishedAuthorSelect },
        },
      }),
      this.prisma.article.findMany({
        where: {
          hidden: false,
          publishedAt: { not: null },
          profile: publishedProfileWhere,
          title: titleMatch,
        },
        orderBy: { publishedAt: 'desc' },
        take: query.limit,
        include: {
          coverWork: { select: { imageKey: true } },
          profile: { select: publishedAuthorSelect },
        },
      }),
      this.prisma.dialogue.findMany({
        where: {
          hidden: false,
          publishedAt: { not: null },
          title: titleMatch,
        },
        orderBy: { publishedAt: 'desc' },
        take: query.limit,
        include: dialogueInclude,
      }),
      this.prisma.profile.findMany({
        where: {
          AND: [
            publishedProfileWhere,
            {
              studioListedAt: { not: null },
              studioHidden: false,
              studioTitle: titleMatch,
            },
          ],
        },
        orderBy: { studioListedAt: 'desc' },
        take: query.limit,
        include: {
          ...profileInclude,
          works: {
            where: { hidden: false },
            orderBy: { id: 'desc' },
            take: 4,
          },
        },
      }),
    ]);

    const works = workRows
      .map((row) => toWorkWithAuthorView(row, this.storage))
      .filter((row): row is WorkWithAuthor => row !== null);

    const creators: PublicProfileWithWorks[] = creatorRows.map((row) => ({
      ...toPublicProfile(toProfileRecord(row), this.storage),
      latestWorks: row.works.map((work) => toWorkView(work, this.storage)),
    }));

    const projects = projectRows
      .map((row) => toProjectSummary(row, this.storage))
      .filter((row): row is ProjectSummary => row !== null);

    const articles: ArticleSummary[] = articleRows.map((row) =>
      toArticleSummary(row, this.storage),
    );

    const dialogues = dialogueRows
      .map((row) => toDialogueSummary(row, this.storage))
      .filter((row): row is DialogueSummary => row !== null);

    const studios = studioRows
      .map((row) => toStudioProfileSummary(row, this.storage))
      .filter((row): row is StudioProfileSummary => row !== null);

    return { q, works, creators, projects, articles, dialogues, studios };
  }
}
