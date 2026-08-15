import 'server-only';

import { ApiError } from '@nechto/api-client';
import type {
  CreatorCatalogPage,
  CreatorCatalogQuery,
  PublicCreatorProfile,
} from '@nechto/api-contract';
import { createServerApiClient } from '@/lib/api-server';

export async function loadPublicProfile(
  slug: string,
): Promise<PublicCreatorProfile | null> {
  try {
    const api = await createServerApiClient();
    return await api.getPublicProfile(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function loadCreators(
  query: CreatorCatalogQuery,
): Promise<CreatorCatalogPage> {
  const api = await createServerApiClient();
  return api.listCreators(query);
}
