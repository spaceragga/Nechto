import type {
  CreatorDirection,
  Profile,
  PublicProfile,
} from '@nechto/api-contract';
import type { StorageService } from '../storage/storage.service';

export type ProfileRecord = {
  id: string;
  userId: string;
  slug: string | null;
  displayName: string | null;
  bio: string | null;
  avatarKey: string | null;
  directions: string[];
  websiteUrl: string | null;
  instagramUrl: string | null;
  telegramUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED';
  user: { email: string };
};

export function toProfileView(
  profile: ProfileRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): Profile {
  return {
    id: profile.id,
    userId: profile.userId,
    email: profile.user.email,
    slug: profile.slug,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarKey
      ? storage.getPublicUrl(profile.avatarKey)
      : null,
    directions: profile.directions as CreatorDirection[],
    websiteUrl: profile.websiteUrl,
    instagramUrl: profile.instagramUrl,
    telegramUrl: profile.telegramUrl,
    status: profile.status,
  };
}

export function toPublicProfileView(
  profile: ProfileRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): PublicProfile {
  const {
    userId: _userId,
    email: _email,
    ...publicProfile
  } = toProfileView(profile, storage);
  return publicProfile;
}
