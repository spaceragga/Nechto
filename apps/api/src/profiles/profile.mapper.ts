import type {
  CreatorDirection,
  Profile,
  PublicProfile,
} from '@nechto/api-contract';
import { CREATOR_DIRECTIONS } from '@nechto/api-contract';
import type { StorageService } from '../storage/storage.service';

export const profileInclude = {
  user: { select: { email: true, suspendedAt: true } },
  _count: { select: { works: true } },
} as const;

type ProfileRow = {
  id: string;
  userId: string;
  displayName: string | null;
  bio: string | null;
  avatarKey: string | null;
  slug: string | null;
  directions: string[];
  websiteUrl: string | null;
  instagramUrl: string | null;
  telegramUrl: string | null;
  user: { email: string; suspendedAt: Date | null };
  _count?: { works: number };
  createdAt: Date;
  updatedAt: Date;
  acceptPolicies?: boolean;
  publishedAt?: Date | null;
};

export type ProfileRecord = ProfileRow & {
  acceptPolicies: boolean;
  publishedAt: Date | null;
};

export type ProfileWrite = {
  displayName?: string | null;
  bio?: string | null;
  avatarKey?: string | null;
  slug?: string | null;
  directions?: string[];
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  telegramUrl?: string | null;
  acceptPolicies?: boolean;
  publishedAt?: Date | null;
};

export function toProfileRecord(row: ProfileRow): ProfileRecord {
  return {
    ...row,
    acceptPolicies: row.acceptPolicies ?? false,
    publishedAt: row.publishedAt ?? null,
  };
}

const directionSet = new Set<string>(CREATOR_DIRECTIONS);

function toDirections(values: string[]): CreatorDirection[] {
  return values.filter((value): value is CreatorDirection =>
    directionSet.has(value),
  );
}

export function toPublicProfile(
  profile: ProfileRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): PublicProfile {
  return {
    slug: profile.slug,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarKey
      ? storage.getPublicUrl(profile.avatarKey)
      : null,
    directions: toDirections(profile.directions ?? []),
    websiteUrl: profile.websiteUrl,
    instagramUrl: profile.instagramUrl,
    telegramUrl: profile.telegramUrl,
    publishedAt: profile.publishedAt?.toISOString() ?? null,
    workCount: profile._count?.works ?? 0,
  };
}

export function toProfileView(
  profile: ProfileRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): Profile {
  return {
    ...toPublicProfile(profile, storage),
    id: profile.id,
    userId: profile.userId,
    email: profile.user.email,
    acceptPolicies: profile.acceptPolicies,
    suspendedAt: profile.user.suspendedAt?.toISOString() ?? null,
  };
}
