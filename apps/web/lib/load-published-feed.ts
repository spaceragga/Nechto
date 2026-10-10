import { ApiError } from '@nechto/api-client';
import type {
  ArticleSummary,
  CreatorDirection,
  CursorPage,
  DialogueSummary,
  PublicArticle,
  PublicDialogue,
  PublicProfile,
  PublicProfileWithWorks,
  ProjectSummary,
  PublicProject,
  Work,
  StudioProfileSummary,
  WorkWithAuthor,
} from '@nechto/api-contract';
import { CREATOR_DIRECTIONS } from '@nechto/api-contract';
import { createServerApiClient } from '@/lib/api-server';

export type PublishedCreator = PublicProfileWithWorks & {
  slug: string;
  studioTitle?: string | null;
  studioDescription?: string | null;
  studioCoverUrl?: string | null;
};

function parseDirection(
  value: string | undefined,
): CreatorDirection | undefined {
  if (!value) {
    return undefined;
  }
  return CREATOR_DIRECTIONS.find((item) => item === value);
}

function creatorsWithSlug(items: PublicProfileWithWorks[]): PublishedCreator[] {
  return items.filter((creator): creator is PublishedCreator =>
    Boolean(creator.slug),
  );
}

function studioProfileToCreator(
  profile: StudioProfileSummary,
): PublishedCreator {
  return {
    slug: profile.slug,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    directions: profile.directions,
    websiteUrl: null,
    instagramUrl: null,
    telegramUrl: null,
    publishedAt: profile.studioListedAt,
    workCount: profile.latestWorks.length,
    inStudio: Boolean(profile.studioListedAt && !profile.studioHidden),
    homeFeaturedAt: null,
    homeSelectionAt: null,
    studioTitle: profile.title,
    studioDescription: profile.description,
    studioCoverUrl: profile.coverUrl,
    latestWorks: profile.latestWorks,
  };
}

export async function loadStudioProfiles(
  limit = 24,
): Promise<PublishedCreator[]> {
  try {
    const api = await createServerApiClient();
    const page = await api.listStudioProfiles({ limit });
    return page.items.map(studioProfileToCreator);
  } catch {
    return [];
  }
}

export async function loadHomeStudioProfile(): Promise<PublishedCreator | null> {
  const profiles = await loadStudioProfiles(12);
  return profiles[0] ?? null;
}

export async function loadHomeBillboard(): Promise<WorkWithAuthor | null> {
  try {
    const api = await createServerApiClient();
    return await api.getHomeBillboard();
  } catch {
    return null;
  }
}

export async function loadHomeHangings(): Promise<WorkWithAuthor[]> {
  try {
    const api = await createServerApiClient();
    return await api.listHomeHangings();
  } catch {
    return [];
  }
}

export async function loadHomeCreator(): Promise<PublishedCreator | null> {
  const creators = await loadPublishedCreators({ limit: 12 });
  return creators.find((creator) => creator.homeFeaturedAt) ?? null;
}

export async function loadHomeAuthorSelection(): Promise<PublishedCreator[]> {
  try {
    const api = await createServerApiClient();
    return creatorsWithSlug(await api.listHomeAuthorSelection());
  } catch {
    return [];
  }
}

export async function loadHomeSeries(): Promise<ProjectSummary | null> {
  const series = await loadPublishedProjects({ limit: 12 });
  return series.find((item) => item.featuredAt) ?? null;
}

export async function loadStudioProfileBySlug(
  slug: string,
): Promise<StudioProfileSummary | null> {
  try {
    const api = await createServerApiClient();
    return await api.getStudioProfile(slug);
  } catch {
    return null;
  }
}

export async function loadStudioWorks(limit = 18): Promise<WorkWithAuthor[]> {
  const creators = await loadStudioProfiles(24);
  const works: WorkWithAuthor[] = [];
  for (const creator of creators) {
    for (const work of creator.latestWorks) {
      works.push({
        ...work,
        author: {
          slug: creator.slug,
          displayName: creator.displayName ?? creator.slug,
          avatarUrl: creator.avatarUrl,
          directions: creator.directions,
        },
      });
      if (works.length >= limit) {
        return works;
      }
    }
  }
  return works;
}

export async function loadPublishedCreators(options?: {
  direction?: string;
  limit?: number;
}): Promise<PublishedCreator[]> {
  try {
    const api = await createServerApiClient();
    const page = await api.listCreators({
      direction: parseDirection(options?.direction),
      limit: options?.limit ?? 20,
    });
    return creatorsWithSlug(page.items);
  } catch {
    return [];
  }
}

function withAuthorDirections(work: WorkWithAuthor): WorkWithAuthor {
  return {
    ...work,
    author: {
      ...work.author,
      directions: work.author.directions ?? [],
    },
  };
}

export async function loadPublishedWorksPage(options?: {
  limit?: number;
  cursor?: string;
  direction?: string;
}): Promise<CursorPage<WorkWithAuthor>> {
  try {
    const api = await createServerApiClient();
    const page = await api.listPublishedWorks({
      limit: options?.limit ?? 24,
      cursor: options?.cursor,
      direction: parseDirection(options?.direction),
    });
    return {
      items: page.items.map(withAuthorDirections),
      nextCursor: page.nextCursor,
    };
  } catch {
    return { items: [], nextCursor: null };
  }
}

export async function loadPublishedWorks(limit = 8): Promise<WorkWithAuthor[]> {
  const page = await loadPublishedWorksPage({ limit });
  return page.items;
}

export async function loadPublishedWork(
  id: string,
): Promise<WorkWithAuthor | null> {
  try {
    const api = await createServerApiClient();
    return withAuthorDirections(await api.getWork(id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    return null;
  }
}

export async function loadPublishedProfile(slug: string): Promise<{
  profile: PublicProfile;
  works: Work[];
  projects: ProjectSummary[];
  articles: ArticleSummary[];
} | null> {
  try {
    const api = await createServerApiClient();
    const profile = await api.getProfileBySlug(slug);
    const [works, projects, articles] = await Promise.all([
      api.listWorksBySlug(slug, { limit: 50 }).catch(() => ({ items: [] })),
      api.listProjectsBySlug(slug, { limit: 50 }).catch(() => ({ items: [] })),
      api.listArticlesBySlug(slug, { limit: 50 }).catch(() => ({ items: [] })),
    ]);
    return {
      profile,
      works: works.items,
      projects: projects.items,
      articles: articles.items,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    return null;
  }
}

export async function loadPublishedProject(
  id: string,
): Promise<PublicProject | null> {
  try {
    const api = await createServerApiClient();
    return await api.getProject(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    return null;
  }
}

export async function loadPublishedProjectsPage(options?: {
  limit?: number;
  cursor?: string;
  direction?: string;
}): Promise<CursorPage<ProjectSummary>> {
  try {
    const api = await createServerApiClient();
    return await api.listPublishedProjects({
      limit: options?.limit ?? 24,
      cursor: options?.cursor,
      direction: parseDirection(options?.direction),
    });
  } catch {
    return { items: [], nextCursor: null };
  }
}

export async function loadPublishedProjects(options?: {
  limit?: number;
  direction?: string;
}): Promise<ProjectSummary[]> {
  const page = await loadPublishedProjectsPage(options);
  return page.items;
}

export async function loadPublishedArticlesPage(options?: {
  limit?: number;
  cursor?: string;
}): Promise<CursorPage<ArticleSummary>> {
  try {
    const api = await createServerApiClient();
    return await api.listPublishedArticles({
      limit: options?.limit ?? 24,
      cursor: options?.cursor,
    });
  } catch {
    return { items: [], nextCursor: null };
  }
}

export async function loadPublishedArticles(
  limit = 24,
): Promise<ArticleSummary[]> {
  const page = await loadPublishedArticlesPage({ limit });
  return page.items;
}

export async function loadHomeJournalArticle(): Promise<ArticleSummary | null> {
  const articles = await loadPublishedArticles(12);
  return articles.find((item) => item.featuredAt) ?? articles[0] ?? null;
}

export async function loadPublishedDialoguesPage(options?: {
  limit?: number;
  cursor?: string;
}): Promise<CursorPage<DialogueSummary>> {
  try {
    const api = await createServerApiClient();
    return await api.listPublishedDialogues({
      limit: options?.limit ?? 24,
      cursor: options?.cursor,
    });
  } catch {
    return { items: [], nextCursor: null };
  }
}

export async function loadPublishedDialogues(
  limit = 24,
): Promise<DialogueSummary[]> {
  const page = await loadPublishedDialoguesPage({ limit });
  return page.items;
}

export async function loadHomeDialogue(): Promise<DialogueSummary | null> {
  const dialogues = await loadPublishedDialogues(12);
  return dialogues.find((item) => item.featuredAt) ?? dialogues[0] ?? null;
}

export async function loadPublishedDialogue(
  id: string,
): Promise<PublicDialogue | null> {
  try {
    const api = await createServerApiClient();
    return await api.getDialogue(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    return null;
  }
}

export async function loadPublishedArticle(
  id: string,
): Promise<PublicArticle | null> {
  try {
    const api = await createServerApiClient();
    return await api.getArticle(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    return null;
  }
}
