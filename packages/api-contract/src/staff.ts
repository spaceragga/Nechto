import { z } from 'zod';

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
};

export type CurationDesk = {
  pairings: [];
  hangings: [];
  issues: [];
  channels: [];
};

export function emptyStaffAccess(): StaffAccess {
  return {
    isCurator: false,
    isModerator: false,
    isAdmin: false,
  };
}
