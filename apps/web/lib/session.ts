import { ApiError } from '@nechto/api-client';
import type { AuthUser, Profile, Work } from '@nechto/api-contract';
import { cache } from 'react';
import { createServerApiClient } from '@/lib/api-server';

export type CurrentUserResult =
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'anonymous' }
  | { status: 'unavailable' };

export type LoadFailureKind = 'unauthorized' | 'unavailable' | 'error';

export type MyProfileLoadResult =
  | { ok: true; profile: Profile }
  | { ok: false; kind: LoadFailureKind; status: number | null };

export type MyWorksLoadResult =
  { ok: true; works: Work[] } | { ok: false; kind: 'unavailable' };

function isAuthError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError && (error.status === 401 || error.status === 403)
  );
}

function isUnavailableError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return true;
  }
  return error.status === 503 || error.status >= 500;
}

export const getCurrentUser = cache(async (): Promise<CurrentUserResult> => {
  try {
    const api = await createServerApiClient();
    const { user } = await api.me();
    return { status: 'authenticated', user };
  } catch (error) {
    if (isAuthError(error)) {
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
    if (isAuthError(error)) {
      return { ok: false, kind: 'unauthorized', status: error.status };
    }
    if (isUnavailableError(error)) {
      return {
        ok: false,
        kind: 'unavailable',
        status: error instanceof ApiError ? error.status : null,
      };
    }
    return {
      ok: false,
      kind: 'error',
      status: error instanceof ApiError ? error.status : null,
    };
  }
});

export const loadMyWorks = cache(async (): Promise<MyWorksLoadResult> => {
  try {
    const api = await createServerApiClient();
    return { ok: true, works: await api.listMyWorks() };
  } catch (error) {
    if (isAuthError(error)) {
      return { ok: true, works: [] };
    }
    return { ok: false, kind: 'unavailable' };
  }
});
