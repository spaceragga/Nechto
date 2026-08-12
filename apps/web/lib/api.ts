import { createApiClient } from '@nechto/api-client';
import type {
  AuthUser,
  LoginDto,
  Profile,
  RegisterDto,
  UpdateProfileDto,
} from '@nechto/api-contract';
import { env } from '@/lib/env';

export type { AuthUser, Profile };

const api = createApiClient({
  baseUrl: env.NEXT_PUBLIC_API_URL,
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

export function meRequest() {
  return api.me();
}

export function getMyProfileRequest() {
  return api.getMyProfile();
}

export function updateMyProfileRequest(input: UpdateProfileDto) {
  return api.updateMyProfile(input);
}

export function uploadMyAvatarRequest(file: File) {
  return api.uploadMyAvatar(file, file.name);
}
