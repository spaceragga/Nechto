import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(128),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

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
