import { z } from 'zod';
import type { CreatorDirection } from './directions';

const WORK_TITLE_MAX = 80;
const WORK_DESCRIPTION_MAX = 2000;

const workTitleSchema = z.string().trim().min(1).max(WORK_TITLE_MAX);
const workDescriptionSchema = z.string().trim().max(WORK_DESCRIPTION_MAX);

export const createWorkFieldsSchema = z.object({
  title: workTitleSchema,
  description: workDescriptionSchema.optional().default(''),
});

export type CreateWorkFields = z.infer<typeof createWorkFieldsSchema>;

export const updateWorkFieldsSchema = z
  .object({
    title: workTitleSchema.optional(),
    description: workDescriptionSchema.optional(),
    hidden: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.hidden !== undefined,
    { message: 'At least one field is required' },
  );

export type UpdateWorkFields = z.infer<typeof updateWorkFieldsSchema>;

/** Max works a curator can pin on the home hanging strip. */
export const HOME_HANGING_MAX = 5;

export type Work = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  hidden: boolean;
  /** Home billboard pin. */
  featuredAt: string | null;
  /** Home hanging strip pin. */
  hangingAt: string | null;
  createdAt: string;
};

export type WorkAuthor = {
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  directions: CreatorDirection[];
};

export type WorkWithAuthor = Work & {
  author: WorkAuthor;
};
