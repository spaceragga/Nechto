import { ApiError } from '@nechto/api-client';
import type { AuthUser, Profile } from '@nechto/api-contract';
import { cache } from 'react';
import { createServerApiClient } from '@/lib/api-server';

export type CurrentUserResult =
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'anonymous' }
  | { status: 'unavailable' };

export type MyProfileLoadResult =
  { ok: true; profile: Profile } | { ok: false; status: number | null };

export const getCurrentUser = cache(async (): Promise<CurrentUserResult> => {
  try {
    const api = await createServerApiClient();
    const { user } = await api.me();
    return { status: 'authenticated', user };
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      return { status: 'anonymous' };
    }
    return { status: 'unavailable' };
  }
});

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
