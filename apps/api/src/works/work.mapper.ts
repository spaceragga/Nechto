import {
  CREATOR_DIRECTIONS,
  type CreatorDirection,
  type Work,
  type WorkWithAuthor,
} from '@nechto/api-contract';
import type { StorageService } from '../storage/storage.service';

const directionSet = new Set<string>(CREATOR_DIRECTIONS);

function toDirections(values: string[]): CreatorDirection[] {
  return values.filter((value): value is CreatorDirection =>
    directionSet.has(value),
  );
}

export type WorkRecord = {
  id: string;
  title: string;
  description: string;
  imageKey: string;
  createdAt: Date;
};

export type WorkWithProfileRecord = WorkRecord & {
  profile: {
    slug: string | null;
    displayName: string | null;
    avatarKey: string | null;
    directions: string[];
  };
};

export function toWorkView(
  work: WorkRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): Work {
  return {
    id: work.id,
    title: work.title,
    description: work.description,
    imageUrl: storage.getPublicUrl(work.imageKey),
    createdAt: work.createdAt.toISOString(),
  };
}

export function toWorkWithAuthorView(
  work: WorkWithProfileRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): WorkWithAuthor | null {
  if (!work.profile.slug) {
    return null;
  }

  return {
    ...toWorkView(work, storage),
    author: {
      slug: work.profile.slug,
      displayName: work.profile.displayName ?? work.profile.slug,
      avatarUrl: work.profile.avatarKey
        ? storage.getPublicUrl(work.profile.avatarKey)
        : null,
      directions: toDirections(work.profile.directions ?? []),
    },
  };
}
