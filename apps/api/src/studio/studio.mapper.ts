import type { StudioProfileSummary } from '@nechto/api-contract';
import {
  toProfileRecord,
  toPublicProfile,
  type ProfileRecord,
} from '../profiles/profile.mapper';
import { toWorkView } from '../works/work.mapper';
import type { StorageService } from '../storage/storage.service';

/** Prisma row before `toProfileRecord` fills optional home/studio pins. */
type StudioProfileRow = Parameters<typeof toProfileRecord>[0] & {
  works?: Array<{
    id: string;
    title: string;
    description: string;
    imageKey: string;
    hidden: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

function baseSummary(
  record: ProfileRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
  works: StudioProfileRow['works'],
): StudioProfileSummary | null {
  const publicProfile = toPublicProfile(record, storage);
  if (!publicProfile.slug) {
    return null;
  }

  const title =
    record.studioTitle?.trim() ||
    publicProfile.displayName ||
    publicProfile.slug;

  return {
    profileId: record.id,
    slug: publicProfile.slug,
    displayName: publicProfile.displayName ?? publicProfile.slug,
    title,
    description: record.studioDescription?.trim() ?? '',
    coverUrl: record.studioCoverKey
      ? storage.getPublicUrl(record.studioCoverKey)
      : null,
    bio: publicProfile.bio ?? '',
    avatarUrl: publicProfile.avatarUrl,
    directions: publicProfile.directions,
    themes: publicProfile.directions,
    studioListedAt: record.studioListedAt?.toISOString() ?? null,
    studioFeaturedAt: record.studioFeaturedAt?.toISOString() ?? null,
    studioHidden: record.studioHidden,
    latestWorks: (works ?? []).map((work) => toWorkView(work, storage)),
  };
}

export function toStudioProfileSummary(
  profile: StudioProfileRow,
  storage: Pick<StorageService, 'getPublicUrl'>,
): StudioProfileSummary | null {
  const record = toProfileRecord(profile);
  const summary = baseSummary(record, storage, profile.works);
  if (!summary?.studioListedAt) {
    return null;
  }
  return summary;
}

export function toStudioCandidate(
  profile: StudioProfileRow,
  storage: Pick<StorageService, 'getPublicUrl'>,
): StudioProfileSummary | null {
  const record = toProfileRecord(profile);
  return baseSummary(record, storage, profile.works);
}
