import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  type StaffUser,
  type StaffUserList,
  type UpdateStaffAccessDto,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';

const staffUserSelect = {
  id: true,
  email: true,
  isCurator: true,
  isModerator: true,
  isAdmin: true,
  profile: { select: { displayName: true } },
} as const;

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<StaffUserList> {
    const users = await this.prisma.user.findMany({
      orderBy: { email: 'asc' },
      select: staffUserSelect,
    });

    return { items: users.map(toStaffUser) };
  }

  async updateAccess(
    id: string,
    access: UpdateStaffAccessDto,
  ): Promise<StaffUser> {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.USER_NOT_FOUND,
        'User not found',
      );
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        isCurator: access.isCurator,
        isModerator: access.isModerator,
        isAdmin: access.isAdmin,
      },
      select: staffUserSelect,
    });
    return toStaffUser(user);
  }
}

function toStaffUser(user: {
  id: string;
  email: string;
  isCurator: boolean;
  isModerator: boolean;
  isAdmin: boolean;
  profile: { displayName: string | null } | null;
}): StaffUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.profile?.displayName ?? null,
    isCurator: user.isCurator,
    isModerator: user.isModerator,
    isAdmin: user.isAdmin,
  };
}
