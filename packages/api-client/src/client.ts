import {
  API_ERROR_CODES,
  type AuthUserResponse,
  type HealthResponse,
  type HelloResponse,
  type LoginDto,
  type LogoutResponse,
  type Profile,
  type RegisterDto,
  type UpdateProfileDto,
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
    return this.request<Profile>(`/profiles/${userId}`);
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
