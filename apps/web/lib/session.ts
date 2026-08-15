import { ApiError } from '@nechto/api-client';
import type { AuthUser, Profile } from '@nechto/api-contract';
import { cache } from 'react';
import { createServerApiClient } from '@/lib/api-server';

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const api = await createServerApiClient();
    const { user } = await api.me();
    return user;
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      return null;
    }
    return null;
  }
});

export type MyProfileLoadResult =
  { ok: true; profile: Profile } | { ok: false; status: number | null };

export const loadMyProfile = cache(async (): Promise<MyProfileLoadResult> => {
  try {
    const api = await createServerApiClient();
    const profile = await api.getMyProfile();
    return { ok: true, profile };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, status: error.status };
    }
    return { ok: false, status: null };
  }
});
