import { z } from 'zod';

/** HttpOnly JWT cookie name — keep in sync across API Set-Cookie and web RSC forwarding. */
export const ACCESS_TOKEN_COOKIE = 'nechto_access_token';

export const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
  locale: z.enum(['ru', 'en']).default('ru'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthUserResponse = {
  user: AuthUser;
};

export type LogoutResponse = {
  ok: boolean;
};

export type AuthActionResponse = {
  ok: true;
};
