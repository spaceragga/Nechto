import {
  API_ERROR_CODES,
  type AccountActionResponse,
  type Article,
  type ArticleSummary,
  type AuthUserResponse,
  type AuthActionResponse,
  type ChangePasswordDto,
  type CreateArticleFields,
  type CreateDialogueFields,
  type CreateWorkFields,
  type CurationDesk,
  type CursorPage,
  type CursorPageQuery,
  type DeleteAccountDto,
  type DialogueSummary,
  type ForgotPasswordDto,
  type HealthResponse,
  type HelloResponse,
  type ListAdminUsersQuery,
  type ListCurationWorksQuery,
  type ListCreatorsQuery,
  type LoginDto,
  type LogoutResponse,
  type ModerationDesk,
  type Profile,
  type PublicArticle,
  type PublicDialogue,
  type PublicProfile,
  type PublicProfileWithWorks,
  type Project,
  type ProjectSummary,
  type PublicProject,
  type CreateProjectFields,
  type ReplaceProjectBlocks,
  type UpdateProjectFields,
  type RegisterDto,
  type ResetPasswordDto,
  type StaffUser,
  type StaffUserList,
  type StudioProfileSummary,
  type UpdateArticleFields,
  type UpdateDialogueFields,
  type UpdateProfileDto,
  type UpdateStaffAccessDto,
  type UpdateWorkFields,
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

  forgotPassword(input: ForgotPasswordDto) {
    return this.request<AuthActionResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  resetPassword(input: ResetPasswordDto) {
    return this.request<AuthActionResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  changePassword(input: ChangePasswordDto) {
    return this.request<AuthActionResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  getMyProfile() {
    return this.request<Profile>('/profiles/me');
  }

  suspendAccount() {
    return this.request<Profile>('/account/suspend', { method: 'POST' });
  }

  restoreAccount() {
    return this.request<Profile>('/account/restore', { method: 'POST' });
  }

  deleteAccount(input: DeleteAccountDto) {
    return this.request<AccountActionResponse>('/account', {
      method: 'DELETE',
      body: JSON.stringify(input),
    });
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

  uploadMyStudioCover(file: Blob, fileName = 'studio-cover') {
    const body = new FormData();
    body.append('file', file, fileName);
    return this.request<Profile>('/profiles/me/studio/cover', {
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

  listPublishedWorks(query: Partial<ListCreatorsQuery> = {}) {
    return this.request<CursorPage<WorkWithAuthor>>(
      `/works${toSearchParams(query)}`,
    );
  }

  listWorksBySlug(slug: string, query: Partial<CursorPageQuery> = {}) {
    return this.request<CursorPage<Work>>(
      `/works/profile/${encodeURIComponent(slug)}${toSearchParams(query)}`,
    );
  }

  getWork(id: string) {
    return this.request<WorkWithAuthor>(`/works/${encodeURIComponent(id)}`);
  }

  uploadMyWork(file: Blob, fields: CreateWorkFields, fileName = 'work') {
    const body = new FormData();
    body.append('file', file, fileName);
    body.append('title', fields.title);
    body.append('description', fields.description ?? '');
    return this.request<Work>('/works', {
      method: 'POST',
      body,
    });
  }

  updateMyWork(workId: string, fields: UpdateWorkFields) {
    return this.request<Work>(`/works/${encodeURIComponent(workId)}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });
  }

  deleteMyWork(workId: string) {
    return this.request<void>(`/works/${encodeURIComponent(workId)}`, {
      method: 'DELETE',
    });
  }

  listMyProjects(query: Partial<CursorPageQuery> = {}) {
    return this.request<CursorPage<Project>>(
      `/projects/me${toSearchParams(query)}`,
    );
  }

  getMyProject(id: string) {
    return this.request<Project>(`/projects/me/${encodeURIComponent(id)}`);
  }

  listProjectsBySlug(slug: string, query: Partial<CursorPageQuery> = {}) {
    return this.request<CursorPage<ProjectSummary>>(
      `/projects/profile/${encodeURIComponent(slug)}${toSearchParams(query)}`,
    );
  }

  listPublishedProjects(query: Partial<ListCreatorsQuery> = {}) {
    return this.request<CursorPage<ProjectSummary>>(
      `/projects${toSearchParams(query)}`,
    );
  }

  getProject(id: string) {
    return this.request<PublicProject>(`/projects/${encodeURIComponent(id)}`);
  }

  createMyProject(fields: CreateProjectFields) {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(fields),
    });
  }

  updateMyProject(projectId: string, fields: UpdateProjectFields) {
    return this.request<Project>(`/projects/${encodeURIComponent(projectId)}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });
  }

  replaceMyProjectBlocks(projectId: string, fields: ReplaceProjectBlocks) {
    return this.request<Project>(
      `/projects/${encodeURIComponent(projectId)}/blocks`,
      {
        method: 'PUT',
        body: JSON.stringify(fields),
      },
    );
  }

  deleteMyProject(projectId: string) {
    return this.request<void>(`/projects/${encodeURIComponent(projectId)}`, {
      method: 'DELETE',
    });
  }

  listMyArticles(query: Partial<CursorPageQuery> = {}) {
    return this.request<CursorPage<Article>>(
      `/articles/me${toSearchParams(query)}`,
    );
  }

  getMyArticle(id: string) {
    return this.request<Article>(`/articles/me/${encodeURIComponent(id)}`);
  }

  listPublishedArticles(query: Partial<CursorPageQuery> = {}) {
    return this.request<CursorPage<ArticleSummary>>(
      `/articles${toSearchParams(query)}`,
    );
  }

  listArticlesBySlug(slug: string, query: Partial<CursorPageQuery> = {}) {
    return this.request<CursorPage<ArticleSummary>>(
      `/articles/profile/${encodeURIComponent(slug)}${toSearchParams(query)}`,
    );
  }

  getArticle(id: string) {
    return this.request<PublicArticle>(`/articles/${encodeURIComponent(id)}`);
  }

  createMyArticle(fields: CreateArticleFields) {
    return this.request<Article>('/articles', {
      method: 'POST',
      body: JSON.stringify(fields),
    });
  }

  updateMyArticle(articleId: string, fields: UpdateArticleFields) {
    return this.request<Article>(`/articles/${encodeURIComponent(articleId)}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });
  }

  publishMyArticle(articleId: string) {
    return this.request<Article>(
      `/articles/${encodeURIComponent(articleId)}/publish`,
      { method: 'POST' },
    );
  }

  unpublishMyArticle(articleId: string) {
    return this.request<Article>(
      `/articles/${encodeURIComponent(articleId)}/unpublish`,
      { method: 'POST' },
    );
  }

  deleteMyArticle(articleId: string) {
    return this.request<void>(`/articles/${encodeURIComponent(articleId)}`, {
      method: 'DELETE',
    });
  }

  featureArticle(articleId: string) {
    return this.request<ArticleSummary>(
      `/curation/articles/${encodeURIComponent(articleId)}/feature`,
      { method: 'POST' },
    );
  }

  unfeatureArticle(articleId: string) {
    return this.request<ArticleSummary>(
      `/curation/articles/${encodeURIComponent(articleId)}/feature`,
      { method: 'DELETE' },
    );
  }

  hideArticle(articleId: string) {
    return this.request<ArticleSummary>(
      `/moderation/articles/${encodeURIComponent(articleId)}/hide`,
      { method: 'POST' },
    );
  }

  unhideArticle(articleId: string) {
    return this.request<ArticleSummary>(
      `/moderation/articles/${encodeURIComponent(articleId)}/unhide`,
      { method: 'POST' },
    );
  }

  listPublishedDialogues(query: Partial<CursorPageQuery> = {}) {
    return this.request<CursorPage<DialogueSummary>>(
      `/dialogues${toSearchParams(query)}`,
    );
  }

  getDialogue(id: string) {
    return this.request<PublicDialogue>(`/dialogues/${encodeURIComponent(id)}`);
  }

  createDialogue(fields: CreateDialogueFields) {
    return this.request<DialogueSummary>('/curation/dialogues', {
      method: 'POST',
      body: JSON.stringify(fields),
    });
  }

  listCurationWorks(query: Partial<ListCurationWorksQuery> = {}) {
    return this.request<CursorPage<WorkWithAuthor>>(
      `/curation/works${toSearchParams(query)}`,
    );
  }

  updateDialogue(dialogueId: string, fields: UpdateDialogueFields) {
    return this.request<DialogueSummary>(
      `/curation/dialogues/${encodeURIComponent(dialogueId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(fields),
      },
    );
  }

  publishDialogue(dialogueId: string) {
    return this.request<DialogueSummary>(
      `/curation/dialogues/${encodeURIComponent(dialogueId)}/publish`,
      { method: 'POST' },
    );
  }

  unpublishDialogue(dialogueId: string) {
    return this.request<DialogueSummary>(
      `/curation/dialogues/${encodeURIComponent(dialogueId)}/unpublish`,
      { method: 'POST' },
    );
  }

  deleteDialogue(dialogueId: string) {
    return this.request<void>(
      `/curation/dialogues/${encodeURIComponent(dialogueId)}`,
      { method: 'DELETE' },
    );
  }

  featureDialogue(dialogueId: string) {
    return this.request<DialogueSummary>(
      `/curation/dialogues/${encodeURIComponent(dialogueId)}/feature`,
      { method: 'POST' },
    );
  }

  unfeatureDialogue(dialogueId: string) {
    return this.request<DialogueSummary>(
      `/curation/dialogues/${encodeURIComponent(dialogueId)}/feature`,
      { method: 'DELETE' },
    );
  }

  hideDialogue(dialogueId: string) {
    return this.request<DialogueSummary>(
      `/moderation/dialogues/${encodeURIComponent(dialogueId)}/hide`,
      { method: 'POST' },
    );
  }

  unhideDialogue(dialogueId: string) {
    return this.request<DialogueSummary>(
      `/moderation/dialogues/${encodeURIComponent(dialogueId)}/unhide`,
      { method: 'POST' },
    );
  }

  listStudioProfiles(query: Partial<CursorPageQuery> = {}) {
    return this.request<CursorPage<StudioProfileSummary>>(
      `/studio${toSearchParams(query)}`,
    );
  }

  getStudioProfile(slug: string) {
    return this.request<StudioProfileSummary>(
      `/studio/${encodeURIComponent(slug)}`,
    );
  }

  listStudioProfile(profileId: string) {
    return this.request<StudioProfileSummary>(
      `/curation/studio/${encodeURIComponent(profileId)}/list`,
      { method: 'POST' },
    );
  }

  unlistStudioProfile(profileId: string) {
    return this.request<StudioProfileSummary>(
      `/curation/studio/${encodeURIComponent(profileId)}/unlist`,
      { method: 'POST' },
    );
  }

  featureStudioProfile(profileId: string) {
    return this.request<StudioProfileSummary>(
      `/curation/studio/${encodeURIComponent(profileId)}/feature`,
      { method: 'POST' },
    );
  }

  unfeatureStudioProfile(profileId: string) {
    return this.request<StudioProfileSummary>(
      `/curation/studio/${encodeURIComponent(profileId)}/feature`,
      { method: 'DELETE' },
    );
  }

  hideStudioProfile(profileId: string) {
    return this.request<StudioProfileSummary>(
      `/moderation/studio/${encodeURIComponent(profileId)}/hide`,
      { method: 'POST' },
    );
  }

  unhideStudioProfile(profileId: string) {
    return this.request<StudioProfileSummary>(
      `/moderation/studio/${encodeURIComponent(profileId)}/unhide`,
      { method: 'POST' },
    );
  }

  listAdminUsers(query: Partial<ListAdminUsersQuery> = {}) {
    return this.request<StaffUserList>(`/admin/users${toSearchParams(query)}`);
  }

  updateStaffAccess(userId: string, access: UpdateStaffAccessDto) {
    return this.request<StaffUser>(
      `/admin/users/${encodeURIComponent(userId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(access),
      },
    );
  }

  getModerationDesk() {
    return this.request<ModerationDesk>('/moderation/desk');
  }

  getCurationDesk() {
    return this.request<CurationDesk>('/curation/desk');
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
  name?: string;
  email?: string;
  q?: string;
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
  if (query.name) {
    params.set('name', query.name);
  }
  if (query.email) {
    params.set('email', query.email);
  }
  if (query.q) {
    params.set('q', query.q);
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}
