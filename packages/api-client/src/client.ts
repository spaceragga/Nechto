import type {
  AuthUserResponse,
  CreatorCatalogPage,
  CreatorCatalogQuery,
  ForgotPasswordDto,
  HealthResponse,
  HelloResponse,
  LoginDto,
  LogoutResponse,
  Profile,
  PublicCreatorProfile,
  ReorderWorksDto,
  RegisterDto,
  ReportProfileDto,
  ResetPasswordDto,
  UpdateProfileDto,
  UpdateWorkDto,
  Work,
  WorkFieldsDto,
  VerifyEmailDto,
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

  forgotPassword(input: ForgotPasswordDto) {
    return this.request<{ ok: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  resetPassword(input: ResetPasswordDto) {
    return this.request<{ ok: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  verifyEmail(input: VerifyEmailDto) {
    return this.request<{ ok: boolean }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  resendVerification() {
    return this.request<{ ok: boolean }>('/auth/resend-verification', {
      method: 'POST',
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

  exportMyAccount() {
    return this.request<unknown>('/profiles/me/export');
  }

  deleteMyAccount() {
    return this.request<void>('/profiles/me', { method: 'DELETE' });
  }

  getPublicProfile(slug: string) {
    return this.request<PublicCreatorProfile>(
      `/profiles/slug/${encodeURIComponent(slug)}`,
    );
  }

  listCreators(query: CreatorCatalogQuery) {
    const params = new URLSearchParams();
    if (query.direction) params.set('direction', query.direction);
    if (query.cursor) params.set('cursor', query.cursor);
    params.set('limit', String(query.limit));
    return this.request<CreatorCatalogPage>(`/profiles?${params.toString()}`);
  }

  recordContactClick(slug: string) {
    return this.request<void>(
      `/profiles/slug/${encodeURIComponent(slug)}/contact`,
      { method: 'POST', keepalive: true },
    );
  }

  reportProfile(slug: string, input: ReportProfileDto) {
    return this.request<{ ok: boolean }>(
      `/profiles/slug/${encodeURIComponent(slug)}/report`,
      { method: 'POST', body: JSON.stringify(input) },
    );
  }

  listMyWorks() {
    return this.request<Work[]>('/works');
  }

  createWork(input: WorkFieldsDto, file: Blob, fileName = 'work') {
    const body = new FormData();
    body.append('title', input.title);
    body.append('altText', input.altText);
    if (input.caption) body.append('caption', input.caption);
    body.append('file', file, fileName);
    return this.request<Work>('/works', { method: 'POST', body });
  }

  updateWork(id: string, input: UpdateWorkDto) {
    return this.request<Work>(`/works/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  reorderWorks(input: ReorderWorksDto) {
    return this.request<void>('/works/reorder', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  deleteWork(id: string) {
    return this.request<void>(`/works/${encodeURIComponent(id)}`, {
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

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      credentials: this.credentials,
      cache: init?.cache ?? this.cache,
      headers,
    });

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
