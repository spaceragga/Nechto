import type { Work, WorkWithAuthor } from '@nechto/api-contract';
import type { StorageService } from '../storage/storage.service';

export type WorkRecord = {
  id: string;
  title: string;
  imageKey: string;
  createdAt: Date;
};

export type WorkWithProfileRecord = WorkRecord & {
  profile: {
    slug: string | null;
    displayName: string | null;
    avatarKey: string | null;
  };
};

export function toWorkView(
  work: WorkRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): Work {
  return {
    id: work.id,
    title: work.title,
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
    },
  };
}
