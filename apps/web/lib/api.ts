import { createApiClient } from '@nechto/api-client';
import type {
  AuthUser,
  ChangePasswordDto,
  CreateArticleFields,
  CreateDialogueFields,
  CreateWorkFields,
  CursorPageQuery,
  DeleteAccountDto,
  ForgotPasswordDto,
  ListAdminUsersQuery,
  ListCreatorsQuery,
  LoginDto,
  Profile,
  CreateProjectFields,
  ReplaceProjectBlocks,
  UpdateArticleFields,
  UpdateProjectFields,
  RegisterDto,
  ResetPasswordDto,
  UpdateProfileDto,
  UpdateStaffAccessDto,
  UpdateWorkFields,
} from '@nechto/api-contract';

export type { AuthUser, Profile };

const api = createApiClient({
  baseUrl: '/api',
});

export function registerRequest(input: RegisterDto) {
  return api.register(input);
}

export function loginRequest(input: LoginDto) {
  return api.login(input);
}

export function logoutRequest() {
  return api.logout();
}

export function forgotPasswordRequest(input: ForgotPasswordDto) {
  return api.forgotPassword(input);
}

export function resetPasswordRequest(input: ResetPasswordDto) {
  return api.resetPassword(input);
}

export function changePasswordRequest(input: ChangePasswordDto) {
  return api.changePassword(input);
}

export function suspendAccountRequest() {
  return api.suspendAccount();
}

export function restoreAccountRequest() {
  return api.restoreAccount();
}

export function deleteAccountRequest(input: DeleteAccountDto) {
  return api.deleteAccount(input);
}

export function updateMyProfileRequest(input: UpdateProfileDto) {
  return api.updateMyProfile(input);
}

export function uploadMyAvatarRequest(file: File) {
  return api.uploadMyAvatar(file, file.name);
}

export function uploadMyStudioCoverRequest(file: File) {
  return api.uploadMyStudioCover(file, file.name);
}

export function publishMyProfileRequest() {
  return api.publishMyProfile();
}

export function unpublishMyProfileRequest() {
  return api.unpublishMyProfile();
}

export function listMyWorksRequest(query: Partial<CursorPageQuery> = {}) {
  return api.listMyWorks(query);
}

export function uploadMyWorkRequest(file: File, fields: CreateWorkFields) {
  return api.uploadMyWork(file, fields, file.name);
}

export function updateMyWorkRequest(workId: string, fields: UpdateWorkFields) {
  return api.updateMyWork(workId, fields);
}

export function deleteMyWorkRequest(workId: string) {
  return api.deleteMyWork(workId);
}

export function listMyProjectsRequest(query: Partial<CursorPageQuery> = {}) {
  return api.listMyProjects(query);
}

export function createMyProjectRequest(fields: CreateProjectFields) {
  return api.createMyProject(fields);
}

export function updateMyProjectRequest(
  projectId: string,
  fields: UpdateProjectFields,
) {
  return api.updateMyProject(projectId, fields);
}

export function replaceMyProjectBlocksRequest(
  projectId: string,
  fields: ReplaceProjectBlocks,
) {
  return api.replaceMyProjectBlocks(projectId, fields);
}

export function deleteMyProjectRequest(projectId: string) {
  return api.deleteMyProject(projectId);
}

export function listMyArticlesRequest(query: Partial<CursorPageQuery> = {}) {
  return api.listMyArticles(query);
}

export function createMyArticleRequest(fields: CreateArticleFields) {
  return api.createMyArticle(fields);
}

export function updateMyArticleRequest(
  articleId: string,
  fields: UpdateArticleFields,
) {
  return api.updateMyArticle(articleId, fields);
}

export function publishMyArticleRequest(articleId: string) {
  return api.publishMyArticle(articleId);
}

export function unpublishMyArticleRequest(articleId: string) {
  return api.unpublishMyArticle(articleId);
}

export function deleteMyArticleRequest(articleId: string) {
  return api.deleteMyArticle(articleId);
}

export function featureBillboardRequest(workId: string) {
  return api.featureBillboard(workId);
}

export function unfeatureBillboardRequest(workId: string) {
  return api.unfeatureBillboard(workId);
}

export function hangWorkRequest(workId: string) {
  return api.hangWork(workId);
}

export function unhangWorkRequest(workId: string) {
  return api.unhangWork(workId);
}

export function featureHomeCreatorRequest(slug: string) {
  return api.featureHomeCreator(slug);
}

export function unfeatureHomeCreatorRequest(slug: string) {
  return api.unfeatureHomeCreator(slug);
}

export function selectHomeCreatorRequest(slug: string) {
  return api.selectHomeCreator(slug);
}

export function unselectHomeCreatorRequest(slug: string) {
  return api.unselectHomeCreator(slug);
}

export function featureChannelRequest(projectId: string) {
  return api.featureChannel(projectId);
}

export function unfeatureChannelRequest(projectId: string) {
  return api.unfeatureChannel(projectId);
}

export function hideWorkRequest(workId: string) {
  return api.hideWork(workId);
}

export function unhideWorkRequest(workId: string) {
  return api.unhideWork(workId);
}

export function featureArticleRequest(articleId: string) {
  return api.featureArticle(articleId);
}

export function unfeatureArticleRequest(articleId: string) {
  return api.unfeatureArticle(articleId);
}

export function hideArticleRequest(articleId: string) {
  return api.hideArticle(articleId);
}

export function unhideArticleRequest(articleId: string) {
  return api.unhideArticle(articleId);
}

export function createDialogueRequest(fields: CreateDialogueFields) {
  return api.createDialogue(fields);
}

export function listCurationWorksRequest(
  query: { q?: string; limit?: number } = {},
) {
  return api.listCurationWorks(query);
}

export function publishDialogueRequest(dialogueId: string) {
  return api.publishDialogue(dialogueId);
}

export function unpublishDialogueRequest(dialogueId: string) {
  return api.unpublishDialogue(dialogueId);
}

export function deleteDialogueRequest(dialogueId: string) {
  return api.deleteDialogue(dialogueId);
}

export function featureDialogueRequest(dialogueId: string) {
  return api.featureDialogue(dialogueId);
}

export function unfeatureDialogueRequest(dialogueId: string) {
  return api.unfeatureDialogue(dialogueId);
}

export function hideDialogueRequest(dialogueId: string) {
  return api.hideDialogue(dialogueId);
}

export function unhideDialogueRequest(dialogueId: string) {
  return api.unhideDialogue(dialogueId);
}

export function listStudioProfileRequest(profileId: string) {
  return api.listStudioProfile(profileId);
}

export function unlistStudioProfileRequest(profileId: string) {
  return api.unlistStudioProfile(profileId);
}

export function featureStudioProfileRequest(profileId: string) {
  return api.featureStudioProfile(profileId);
}

export function unfeatureStudioProfileRequest(profileId: string) {
  return api.unfeatureStudioProfile(profileId);
}

export function hideStudioProfileRequest(profileId: string) {
  return api.hideStudioProfile(profileId);
}

export function unhideStudioProfileRequest(profileId: string) {
  return api.unhideStudioProfile(profileId);
}

export function listAdminUsersRequest(
  query: Partial<ListAdminUsersQuery> = {},
) {
  return api.listAdminUsers(query);
}

export function updateStaffAccessRequest(
  userId: string,
  access: UpdateStaffAccessDto,
) {
  return api.updateStaffAccess(userId, access);
}

export function listPublishedWorksRequest(
  query: Partial<ListCreatorsQuery> = {},
) {
  return api.listPublishedWorks(query);
}

export function listCreatorsRequest(query: Partial<ListCreatorsQuery> = {}) {
  return api.listCreators(query);
}

export { api as browserApi };
