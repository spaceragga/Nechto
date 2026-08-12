import type {
  AuthUserResponse,
  HealthResponse,
  HelloResponse,
  LoginDto,
  LogoutResponse,
  Profile,
  RegisterDto,
  UpdateProfileDto,
} from '@nechto/api-contract';

export type ApiClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
  credentials?: 'include' | 'omit' | 'same-origin';
};

type ApiErrorBody = {
  message?: string | string[];
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

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

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly credentials: 'include' | 'omit' | 'same-origin';

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    // Binding is required: a detached `fetch` reference throws Illegal invocation in browsers.
    const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.fetchImpl = fetchImpl;
    this.credentials = options.credentials ?? 'include';
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
    const headers = new Headers(init?.headers);
    const isFormData =
      typeof FormData !== 'undefined' && init?.body instanceof FormData;

    if (!isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      credentials: this.credentials,
      headers,
    });

    if (!response.ok) {
      throw new ApiError(await parseError(response), response.status);
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
