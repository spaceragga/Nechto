import { z } from 'zod';
import { creatorDirectionSchema } from './directions';

export const cursorPageQuerySchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const creatorListSortSchema = z.enum(['featured', 'published']);

export const listCreatorsQuerySchema = cursorPageQuerySchema.extend({
  direction: creatorDirectionSchema.optional(),
  /** `published` is arrival order. Omitted keeps the home pin first. */
  sort: creatorListSortSchema.optional(),
});

export const listPublishedWorksQuerySchema = listCreatorsQuerySchema;
export const listPublishedProjectsQuerySchema = listCreatorsQuerySchema;

export type CursorPageQuery = z.infer<typeof cursorPageQuerySchema>;
export type ListCreatorsQuery = z.infer<typeof listCreatorsQuerySchema>;
export type ListPublishedWorksQuery = ListCreatorsQuery;
export type ListPublishedProjectsQuery = ListCreatorsQuery;

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};
