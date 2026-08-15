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
export const CURRENT_POLICY_VERSION = '2026-08-15';

export const creatorDirectionSchema = z.enum(CREATOR_DIRECTIONS);
export type CreatorDirection = z.infer<typeof creatorDirectionSchema>;

const optionalUrl = z.string().trim().url().max(500).nullable().optional();

export const updateProfileSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .min(3)
    .max(50)
    .nullable()
    .optional(),
  displayName: z.string().trim().min(1).max(80).nullable().optional(),
  bio: z.string().trim().max(2000).nullable().optional(),
  directions: z.array(creatorDirectionSchema).max(3).optional(),
  websiteUrl: optionalUrl,
  instagramUrl: optionalUrl,
  telegramUrl: optionalUrl,
  acceptPolicies: z.literal(true).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export type Profile = {
  id: string;
  userId: string;
  email: string;
  slug: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  directions: CreatorDirection[];
  websiteUrl: string | null;
  instagramUrl: string | null;
  telegramUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED';
};

export type PublicProfile = Omit<Profile, 'userId' | 'email'>;

export const creatorCatalogQuerySchema = z.object({
  direction: creatorDirectionSchema.optional(),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(24).default(12),
});
export type CreatorCatalogQuery = z.infer<typeof creatorCatalogQuerySchema>;

export type CreatorCatalogPage = {
  items: PublicProfile[];
  nextCursor: string | null;
};
