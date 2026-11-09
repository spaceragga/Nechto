import { randomUUID } from 'node:crypto';
import { VIEWER_KEY_COOKIE } from '@nechto/api-contract';
import type { Request, Response } from 'express';
import { env } from '../config/env';

const VIEWER_KEY_MAX_AGE_MS = 400 * 24 * 60 * 60 * 1000;

export function readViewerKey(request: Request): string | null {
  const value = request.cookies?.[VIEWER_KEY_COOKIE];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function ensureViewerKey(request: Request, response: Response): string {
  const existing = readViewerKey(request);
  if (existing) {
    return existing;
  }
  const viewerKey = randomUUID();
  response.cookie(VIEWER_KEY_COOKIE, viewerKey, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.COOKIE_SECURE,
    path: '/',
    maxAge: VIEWER_KEY_MAX_AGE_MS,
  });
  return viewerKey;
}
