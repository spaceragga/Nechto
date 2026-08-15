import type { Response } from 'express';
import { ACCESS_TOKEN_COOKIE, env, jwtExpiresInToMs } from '../config/env';

export function setAccessTokenCookie(response: Response, token: string): void {
  response.cookie(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.COOKIE_SECURE,
    path: '/',
    maxAge: jwtExpiresInToMs(env.JWT_EXPIRES_IN),
  });
}

export function clearAccessTokenCookie(response: Response): void {
  response.clearCookie(ACCESS_TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.COOKIE_SECURE,
    path: '/',
  });
}
