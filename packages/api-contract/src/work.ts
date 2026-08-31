import { z } from 'zod';
import type { CreatorDirection } from './directions';

export const createWorkFieldsSchema = z.object({
  title: z.string().trim().min(1).max(80),
});

export type CreateWorkFields = z.infer<typeof createWorkFieldsSchema>;

export type Work = {
  id: string;
  title: string;
  imageUrl: string;
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
