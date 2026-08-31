import { ApiError } from '@nechto/api-client';
import type {
  CreatorDirection,
  PublicProfile,
  PublicProfileWithWorks,
  Work,
  WorkWithAuthor,
} from '@nechto/api-contract';
import { CREATOR_DIRECTIONS } from '@nechto/api-contract';
import { createServerApiClient } from '@/lib/api-server';

export type PublishedCreator = PublicProfileWithWorks & { slug: string };

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

export async function loadPublishedWorks(limit = 8): Promise<WorkWithAuthor[]> {
  try {
    const api = await createServerApiClient();
    const page = await api.listPublishedWorks({ limit });
    return page.items;
  } catch {
    return [];
  }
}

export async function loadPublishedProfile(
  slug: string,
): Promise<{ profile: PublicProfile; works: Work[] } | null> {
  try {
    const api = await createServerApiClient();
    const profile = await api.getProfileBySlug(slug);
    const works = await api.listWorksBySlug(slug, { limit: 50 });
    return { profile, works: works.items };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    return null;
  }
}
