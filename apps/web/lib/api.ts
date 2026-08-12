import { env } from '@/lib/env';

export type AuthUser = {
  id: string;
  email: string;
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
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
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
