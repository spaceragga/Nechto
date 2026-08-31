import { z } from 'zod';

export const CREATOR_DIRECTIONS = [
  'illustration',
  'graphic-design',
  'photography',
  'fashion',
  'craft',
  'video',
  'interior',
  'beauty',
] as const;

export type CreatorDirection = (typeof CREATOR_DIRECTIONS)[number];

export const creatorDirectionSchema = z.enum(CREATOR_DIRECTIONS);

export const RESERVED_PROFILE_SLUGS = [
  'me',
  'demo',
  'new',
  'admin',
  'api',
  'login',
  'register',
  'profile',
  'account',
  'creators',
  'journal',
  'collections',
  'community',
  'community-guidelines',
  'uploads',
  'en',
  'ru',
  'forgot-password',
  'reset-password',
  'change-password',
  'terms',
  'privacy',
  'verify-email',
  'top-works',
] as const;

const reservedSlugs = new Set<string>(RESERVED_PROFILE_SLUGS);

export const profileSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug')
  .refine((value) => !reservedSlugs.has(value), 'Reserved slug');
