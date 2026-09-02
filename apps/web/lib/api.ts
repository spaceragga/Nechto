import { createApiClient } from '@nechto/api-client';
import type {
  AuthUser,
  ChangePasswordDto,
  CreateWorkFields,
  CursorPageQuery,
  DeleteAccountDto,
  ForgotPasswordDto,
  ListCreatorsQuery,
  LoginDto,
  Profile,
  RegisterDto,
  ResetPasswordDto,
  UpdateProfileDto,
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

export function listPublishedWorksRequest(
  query: Partial<ListCreatorsQuery> = {},
) {
  return api.listPublishedWorks(query);
}

export function listCreatorsRequest(query: Partial<ListCreatorsQuery> = {}) {
  return api.listCreators(query);
}

export { api as browserApi };
