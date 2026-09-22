import type { AuthUser, StaffAccess } from '@nechto/api-contract';
import { emptyStaffAccess } from '@nechto/api-contract';

export const AUTH_USER_SELECT = {
  id: true,
  email: true,
  isCurator: true,
  isModerator: true,
  isAdmin: true,
} as const;

export function toAuthUser(
  user: { id: string; email: string } & Partial<StaffAccess>,
): AuthUser {
  const access = emptyStaffAccess();
  return {
    id: user.id,
    email: user.email,
    isCurator: user.isCurator ?? access.isCurator,
    isModerator: user.isModerator ?? access.isModerator,
    isAdmin: user.isAdmin ?? access.isAdmin,
  };
}
