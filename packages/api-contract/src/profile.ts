import { z } from 'zod';
import {
  creatorDirectionSchema,
  profileSlugSchema,
  type CreatorDirection,
} from './directions';
import { STUDIO_DESCRIPTION_MAX, STUDIO_TITLE_MAX } from './studio';
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

function optionalNullableText(max: number) {
  return z
    .union([z.string().trim().max(max), z.literal(''), z.null()])
    .optional()
    .transform(emptyToNull);
}

export const PUBLISH_MIN_WORKS = 1;

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
  studioTitle: optionalNullableText(STUDIO_TITLE_MAX),
  studioDescription: optionalNullableText(STUDIO_DESCRIPTION_MAX),
  /** Open studio when description/cover + published profile are ready. */
  studioOptIn: z.boolean().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

/** Max authors a curator can pin in the home author-selection strip. */
export const HOME_AUTHOR_SELECTION_MAX = 3;

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
  /** Author listed their studio (and not moderated away). */
  inStudio: boolean;
  /** Home creator-of-the-week pin. */
  homeFeaturedAt: string | null;
  /** Home author-selection strip pin. */
  homeSelectionAt: string | null;
};

export type Profile = PublicProfile & {
  id: string;
  userId: string;
  email: string;
  acceptPolicies: boolean;
  suspendedAt: string | null;
  studioTitle: string | null;
  studioDescription: string | null;
  studioCoverUrl: string | null;
};

export type PublicProfileWithWorks = PublicProfile & {
  latestWorks: Work[];
};
