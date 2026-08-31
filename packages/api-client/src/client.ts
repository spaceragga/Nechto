import {
  API_ERROR_CODES,
  type AuthUserResponse,
  type CreateWorkFields,
  type CursorPage,
  type CursorPageQuery,
  type HealthResponse,
  type HelloResponse,
  type ListCreatorsQuery,
  type LoginDto,
  type LogoutResponse,
  type Profile,
  type PublicProfile,
  type PublicProfileWithWorks,
  type RegisterDto,
  type UpdateProfileDto,
  type Work,
  type WorkWithAuthor,
} from '@nechto/api-contract';
import { ApiError, parseApiErrorResponse } from './api-error';

export { ApiError } from './api-error';

export type ApiClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
  credentials?: 'include' | 'omit' | 'same-origin';
  /** Merged into every request (e.g. Cookie for RSC → API). */
  headers?: HeadersInit;
  /** Passed to fetch; use `no-store` for auth-scoped server reads. */
  cache?: RequestCache;
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly credentials: 'include' | 'omit' | 'same-origin';
  private readonly defaultHeaders: HeadersInit | undefined;
  private readonly cache: RequestCache | undefined;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    // Binding is required: a detached `fetch` reference throws Illegal invocation in browsers.
    const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.fetchImpl = fetchImpl;
    this.credentials = options.credentials ?? 'include';
    this.defaultHeaders = options.headers;
    this.cache = options.cache;
  }

  getHealth() {
    return this.request<HealthResponse>('/health');
  }

  getHello() {
    return this.request<HelloResponse>('/');
  }

  register(input: RegisterDto) {
    return this.request<AuthUserResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  login(input: LoginDto) {
    return this.request<AuthUserResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  logout() {
    return this.request<LogoutResponse>('/auth/logout', {
      method: 'POST',
    });
  }

  me() {
    return this.request<AuthUserResponse>('/auth/me');
  }

  getMyProfile() {
    return this.request<Profile>('/profiles/me');
  }

  getProfile(userId: string) {
    return this.request<PublicProfile>(`/profiles/${userId}`);
  }

  updateMyProfile(input: UpdateProfileDto) {
    return this.request<Profile>('/profiles/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  uploadMyAvatar(file: Blob, fileName = 'avatar') {
    const body = new FormData();
    body.append('file', file, fileName);
    return this.request<Profile>('/profiles/me/avatar', {
      method: 'POST',
      body,
    });
  }

  publishMyProfile() {
    return this.request<Profile>('/profiles/me/publish', { method: 'POST' });
  }

  unpublishMyProfile() {
    return this.request<Profile>('/profiles/me/unpublish', { method: 'POST' });
  }

  getProfileBySlug(slug: string) {
    return this.request<PublicProfile>(
      `/profiles/by-slug/${encodeURIComponent(slug)}`,
    );
  }

  listCreators(query: Partial<ListCreatorsQuery> = {}) {
    return this.request<CursorPage<PublicProfileWithWorks>>(
      `/profiles${toSearchParams(query)}`,
    );
  }

  listMyWorks(query: Partial<CursorPageQuery> = {}) {
    return this.request<CursorPage<Work>>(`/works/me${toSearchParams(query)}`);
  }

  listPublishedWorks(query: Partial<CursorPageQuery> = {}) {
    return this.request<CursorPage<WorkWithAuthor>>(
      `/works${toSearchParams(query)}`,
    );
  }

  listWorksBySlug(slug: string, query: Partial<CursorPageQuery> = {}) {
    return this.request<CursorPage<Work>>(
      `/works/profile/${encodeURIComponent(slug)}${toSearchParams(query)}`,
    );
  }

  uploadMyWork(file: Blob, fields: CreateWorkFields, fileName = 'work') {
    const body = new FormData();
    body.append('file', file, fileName);
    body.append('title', fields.title);
    return this.request<Work>('/works', {
      method: 'POST',
      body,
    });
  }

  deleteMyWork(workId: string) {
    return this.request<void>(`/works/${encodeURIComponent(workId)}`, {
      method: 'DELETE',
    });
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(this.defaultHeaders);
    new Headers(init?.headers).forEach((value, key) => {
      headers.set(key, value);
    });
    const isFormData =
      typeof FormData !== 'undefined' && init?.body instanceof FormData;

    if (init?.body != null && !isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...init,
        credentials: this.credentials,
        cache: init?.cache ?? this.cache,
        headers,
      });
    } catch {
      throw new ApiError(
        'Service unavailable',
        503,
        API_ERROR_CODES.SERVICE_UNAVAILABLE,
      );
    }

    if (!response.ok) {
      const error = await parseApiErrorResponse(response);
      throw new ApiError(
        error.message,
        response.status,
        error.code,
        error.errors,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}

function toSearchParams(query: {
  cursor?: string;
  limit?: number;
  direction?: string;
}): string {
  const params = new URLSearchParams();
  if (query.cursor) {
    params.set('cursor', query.cursor);
  }
  if (query.limit != null) {
    params.set('limit', String(query.limit));
  }
  if (query.direction) {
    params.set('direction', query.direction);
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}
