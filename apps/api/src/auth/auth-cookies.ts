import type { Response } from 'express';
import { ACCESS_TOKEN_COOKIE, env } from '../config/env';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function setAccessTokenCookie(response: Response, token: string): void {
  response.cookie(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.COOKIE_SECURE,
    path: '/',
    maxAge: SEVEN_DAYS_MS,
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
