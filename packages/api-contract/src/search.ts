import { z } from 'zod';
import type { ArticleSummary } from './article';
import type { DialogueSummary } from './dialogue';
import type { ProjectSummary } from './project';
import type { PublicProfileWithWorks } from './profile';
import type { StudioProfileSummary } from './studio';
import type { WorkWithAuthor } from './work';

export const SEARCH_QUERY_MAX = 80;

export const searchQuerySchema = z.object({
  q: z.string().trim().max(SEARCH_QUERY_MAX).optional().default(''),
  limit: z.coerce.number().int().min(1).max(30).optional().default(12),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export type SearchResults = {
  q: string;
  works: WorkWithAuthor[];
  creators: PublicProfileWithWorks[];
  projects: ProjectSummary[];
  articles: ArticleSummary[];
  dialogues: DialogueSummary[];
  studios: StudioProfileSummary[];
};
