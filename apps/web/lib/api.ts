import { env } from '@/lib/env';

export type AuthUser = {
  id: string;
  email: string;
};

export type Profile = {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

type ApiErrorBody = {
  message?: string | string[];
};

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (Array.isArray(body.message)) {
      return body.message.join('; ');
    }
    if (typeof body.message === 'string' && body.message.length > 0) {
      return body.message;
    }
  } catch {
    // Fall through to status text.
  }

  return response.statusText || 'Request failed';
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const isFormData =
    typeof FormData !== 'undefined' && init?.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function registerRequest(input: { email: string; password: string }) {
  return apiRequest<{ user: AuthUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function loginRequest(input: { email: string; password: string }) {
  return apiRequest<{ user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function logoutRequest() {
  return apiRequest<{ ok: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

export function meRequest() {
  return apiRequest<{ user: AuthUser }>('/auth/me');
}

export function getMyProfileRequest() {
  return apiRequest<Profile>('/profiles/me');
}

export function updateMyProfileRequest(input: {
  displayName?: string | null;
  bio?: string | null;
}) {
  return apiRequest<Profile>('/profiles/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function uploadMyAvatarRequest(file: File) {
  const body = new FormData();
  body.append('file', file);
  return apiRequest<Profile>('/profiles/me/avatar', {
    method: 'POST',
    body,
  });
}
