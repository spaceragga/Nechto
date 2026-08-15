import { createApiClient } from '@nechto/api-client';
import type {
  AuthUser,
  LoginDto,
  Profile,
  RegisterDto,
  UpdateProfileDto,
  UpdateWorkDto,
  WorkFieldsDto,
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

export function forgotPasswordRequest(email: string) {
  return api.forgotPassword({ email });
}

export function resetPasswordRequest(token: string, password: string) {
  return api.resetPassword({ token, password });
}

export function verifyEmailRequest(token: string) {
  return api.verifyEmail({ token });
}

export function resendVerificationRequest() {
  return api.resendVerification();
}

export function logoutRequest() {
  return api.logout();
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

export function exportMyAccountRequest() {
  return api.exportMyAccount();
}

export function deleteMyAccountRequest() {
  return api.deleteMyAccount();
}

export function createWorkRequest(input: WorkFieldsDto, file: File) {
  return api.createWork(input, file, file.name);
}

export function updateWorkRequest(id: string, input: UpdateWorkDto) {
  return api.updateWork(id, input);
}

export function deleteWorkRequest(id: string) {
  return api.deleteWork(id);
}

export function recordContactClickRequest(slug: string) {
  return api.recordContactClick(slug);
}

export function reportProfileRequest(
  slug: string,
  input: Parameters<typeof api.reportProfile>[1],
) {
  return api.reportProfile(slug, input);
}
