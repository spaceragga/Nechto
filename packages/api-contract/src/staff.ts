import { z } from 'zod';
import type { ArticleSummary } from './article';

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
  hiddenWorks: [];
  liveArticles: ArticleSummary[];
  hiddenArticles: ArticleSummary[];
};

export type CurationDesk = {
  pairings: [];
  hangings: [];
  issues: ArticleSummary[];
  channels: [];
  featuredArticle: ArticleSummary | null;
};

export function emptyStaffAccess(): StaffAccess {
  return {
    isCurator: false,
    isModerator: false,
    isAdmin: false,
  };
}
