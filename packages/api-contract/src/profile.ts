import { z } from 'zod';
import {
  creatorDirectionSchema,
  profileSlugSchema,
  type CreatorDirection,
} from './directions';
import type { Work } from './work';

function emptyToNull<T extends string>(
  value: T | '' | null | undefined,
): T | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === '' || value === null) {
    return null;
  }
  return value;
}

function optionalNullableUrl() {
  return z
    .union([z.string().trim().url().max(200), z.literal(''), z.null()])
    .optional()
    .transform(emptyToNull);
}

function optionalNullableSlug() {
  return z
    .union([profileSlugSchema, z.literal(''), z.null()])
    .optional()
    .transform(emptyToNull);
}

export const PUBLISH_MIN_WORKS = 5;

export type PublishProfileCheck = {
  displayName: string | null | undefined;
  slug: string | null | undefined;
  acceptPolicies: boolean;
  workCount: number;
};

export function canPublishProfile(input: PublishProfileCheck): boolean {
  return Boolean(
    input.displayName?.trim() &&
    input.slug?.trim() &&
    input.acceptPolicies &&
    input.workCount >= PUBLISH_MIN_WORKS,
  );
}

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).nullable().optional(),
  bio: z.string().trim().max(2000).nullable().optional(),
  slug: optionalNullableSlug(),
  directions: z.array(creatorDirectionSchema).max(3).optional(),
  websiteUrl: optionalNullableUrl(),
  instagramUrl: optionalNullableUrl(),
  telegramUrl: optionalNullableUrl(),
  acceptPolicies: z.boolean().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export type PublicProfile = {
  slug: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  directions: CreatorDirection[];
  websiteUrl: string | null;
  instagramUrl: string | null;
  telegramUrl: string | null;
  publishedAt: string | null;
  workCount: number;
};

export type Profile = PublicProfile & {
  id: string;
  userId: string;
  email: string;
  acceptPolicies: boolean;
  suspendedAt: string | null;
};

export type PublicProfileWithWorks = PublicProfile & {
  latestWorks: Work[];
};
