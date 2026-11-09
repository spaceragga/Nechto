import { z } from 'zod';
import { cursorPageQuerySchema } from './pagination';

export const COMMENT_TARGET_TYPES = [
  'work',
  'project',
  'article',
  'dialogue',
] as const;

export type CommentTargetType = (typeof COMMENT_TARGET_TYPES)[number];

export const commentTargetTypeSchema = z.enum(COMMENT_TARGET_TYPES);

export const COMMENT_BODY_MAX = 2000;

export const createCommentSchema = z.object({
  targetType: commentTargetTypeSchema,
  targetId: z.string().cuid(),
  body: z.string().trim().min(1).max(COMMENT_BODY_MAX),
});

export type CreateCommentDto = z.infer<typeof createCommentSchema>;

export const listCommentsQuerySchema = cursorPageQuerySchema.extend({
  targetType: commentTargetTypeSchema,
  targetId: z.string().cuid(),
});

export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;

export type CommentAuthor = {
  userId: string;
  slug: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export type CommentView = {
  id: string;
  body: string;
  createdAt: string;
  targetType: CommentTargetType;
  targetId: string;
  canDelete: boolean;
  author: CommentAuthor;
};
