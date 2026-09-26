import { z } from 'zod';
import type { WorkAuthor } from './work';

export const ARTICLE_TITLE_MAX = 120;
export const ARTICLE_LEDE_MAX = 280;
export const ARTICLE_BODY_MAX = 20_000;
export const ARTICLE_BODY_MIN_PUBLISH = 400;

const articleTitleSchema = z.string().trim().min(1).max(ARTICLE_TITLE_MAX);
const articleLedeSchema = z.string().trim().max(ARTICLE_LEDE_MAX);
const articleBodySchema = z.string().trim().min(1).max(ARTICLE_BODY_MAX);

export const createArticleFieldsSchema = z.object({
  title: articleTitleSchema,
  lede: articleLedeSchema.optional().default(''),
  body: articleBodySchema,
  coverWorkId: z.string().cuid().nullable().optional(),
});

export type CreateArticleFields = z.infer<typeof createArticleFieldsSchema>;

export const updateArticleFieldsSchema = z
  .object({
    title: articleTitleSchema.optional(),
    lede: articleLedeSchema.optional(),
    body: articleBodySchema.optional(),
    coverWorkId: z.string().cuid().nullable().optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.lede !== undefined ||
      value.body !== undefined ||
      value.coverWorkId !== undefined,
    { message: 'At least one field is required' },
  );

export type UpdateArticleFields = z.infer<typeof updateArticleFieldsSchema>;

export type Article = {
  id: string;
  title: string;
  lede: string;
  body: string;
  coverImageUrl: string | null;
  coverWorkId: string | null;
  publishedAt: string | null;
  featuredAt: string | null;
  hidden: boolean;
  createdAt: string;
};

export type ArticleSummary = {
  id: string;
  title: string;
  lede: string;
  coverImageUrl: string | null;
  publishedAt: string;
  featuredAt: string | null;
  author: WorkAuthor;
};

export type PublicArticle = ArticleSummary & {
  body: string;
};

export function canPublishArticle(input: {
  title: string;
  body: string;
  profilePublished: boolean;
}): boolean {
  return (
    input.profilePublished &&
    input.title.trim().length > 0 &&
    input.body.trim().length >= ARTICLE_BODY_MIN_PUBLISH
  );
}
