import { z } from 'zod';
import { creatorDirectionSchema } from './directions';

export const cursorPageQuerySchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const listCreatorsQuerySchema = cursorPageQuerySchema.extend({
  direction: creatorDirectionSchema.optional(),
});

export const listPublishedWorksQuerySchema = listCreatorsQuerySchema;

export type CursorPageQuery = z.infer<typeof cursorPageQuerySchema>;
export type ListCreatorsQuery = z.infer<typeof listCreatorsQuerySchema>;
export type ListPublishedWorksQuery = ListCreatorsQuery;

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};
