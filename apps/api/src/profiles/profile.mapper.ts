import type { Profile } from '@nechto/api-contract';
import type { StorageService } from '../storage/storage.service';

export type ProfileRecord = {
  id: string;
  userId: string;
  displayName: string | null;
  bio: string | null;
  avatarKey: string | null;
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
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarKey
      ? storage.getPublicUrl(profile.avatarKey)
      : null,
  };
}
