import { z } from 'zod';
import type { ArticleSummary } from './article';
import type { DialogueSummary } from './dialogue';
import type { ProjectSummary } from './project';
import type { PublicProfileWithWorks } from './profile';
import type { StudioProfileSummary } from './studio';
import type { WorkWithAuthor } from './work';

export const STAFF_USER_SEARCH_MIN = 2;

const optionalSearch = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) =>
      value && value.length >= STAFF_USER_SEARCH_MIN ? value : undefined,
    );

export const listAdminUsersQuerySchema = z.object({
  name: optionalSearch(80),
  email: optionalSearch(128),
});

export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>;

export const staffAccessSchema = z.object({
  isCurator: z.boolean(),
  isModerator: z.boolean(),
  isAdmin: z.boolean(),
});

export const updateStaffAccessSchema = staffAccessSchema;

export type StaffAccess = z.infer<typeof staffAccessSchema>;
export type UpdateStaffAccessDto = z.infer<typeof updateStaffAccessSchema>;

export type StaffUser = StaffAccess & {
  id: string;
  email: string;
  displayName: string | null;
};

export type StaffUserList = {
  items: StaffUser[];
};

export type ModerationDesk = {
  reports: [];
  liveWorks: WorkWithAuthor[];
  hiddenWorks: WorkWithAuthor[];
  liveArticles: ArticleSummary[];
  hiddenArticles: ArticleSummary[];
  liveDialogues: DialogueSummary[];
  hiddenDialogues: DialogueSummary[];
  liveStudio: StudioProfileSummary[];
  hiddenStudio: StudioProfileSummary[];
};

export type CurationDesk = {
  pairings: DialogueSummary[];
  hangings: WorkWithAuthor[];
  issues: ArticleSummary[];
  channels: ProjectSummary[];
  creators: PublicProfileWithWorks[];
  featuredArticle: ArticleSummary | null;
  featuredDialogue: DialogueSummary | null;
  featuredBillboard: WorkWithAuthor | null;
  featuredCreator: PublicProfileWithWorks | null;
  /** Curated home author-selection strip (ordered). */
  selectionCreators: PublicProfileWithWorks[];
  featuredChannel: ProjectSummary | null;
  studioListed: StudioProfileSummary[];
  studioCandidates: StudioProfileSummary[];
  featuredStudio: StudioProfileSummary | null;
};

export const CURATION_WORKS_SEARCH_MAX = 80;

export const listCurationWorksQuerySchema = z.object({
  q: z.string().trim().max(CURATION_WORKS_SEARCH_MAX).optional().default(''),
  limit: z.coerce.number().int().min(1).max(50).optional().default(30),
});

export type ListCurationWorksQuery = z.infer<
  typeof listCurationWorksQuerySchema
>;

export function emptyStaffAccess(): StaffAccess {
  return {
    isCurator: false,
    isModerator: false,
    isAdmin: false,
  };
}
