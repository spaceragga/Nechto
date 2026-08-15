import { createApiClient } from '@nechto/api-client';
import type {
  AuthUser,
  LoginDto,
  Profile,
  RegisterDto,
  UpdateProfileDto,
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
