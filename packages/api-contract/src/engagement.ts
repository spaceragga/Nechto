import { z } from 'zod';
import { COMMENT_TARGET_TYPES, commentTargetTypeSchema } from './comment';
import { profileSlugSchema } from './directions';

export const ENGAGEMENT_TARGET_TYPES = COMMENT_TARGET_TYPES;
export type EngagementTargetType = (typeof ENGAGEMENT_TARGET_TYPES)[number];

export const engagementTargetSchema = z.object({
  targetType: commentTargetTypeSchema,
  targetId: z.string().cuid(),
});

export type EngagementTargetDto = z.infer<typeof engagementTargetSchema>;

export const engagementQuerySchema = engagementTargetSchema;

export type EngagementQuery = EngagementTargetDto;

export type EngagementSnapshot = {
  likeCount: number;
  viewCount: number;
  likedByMe: boolean;
};

export const followSlugSchema = z.object({
  slug: profileSlugSchema,
});

export type FollowSlugDto = z.infer<typeof followSlugSchema>;

export type FollowSnapshot = {
  followerCount: number;
  following: boolean;
};
