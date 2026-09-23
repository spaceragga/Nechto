import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  listAdminUsersQuerySchema,
  updateStaffAccessSchema,
  type ListAdminUsersQuery,
  type StaffUser,
  type StaffUserList,
  type UpdateStaffAccessDto,
} from '@nechto/api-contract';
import { RequiresAdmin } from '../auth/requires-access';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AdminUsersService } from './admin-users.service';

@Controller('admin/users')
@RequiresAdmin()
export class AdminUsersController {
  constructor(private readonly adminUsers: AdminUsersService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(listAdminUsersQuerySchema))
    query: ListAdminUsersQuery,
  ): Promise<StaffUserList> {
    return this.adminUsers.list(query);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStaffAccessSchema))
    body: UpdateStaffAccessDto,
  ): Promise<StaffUser> {
    return this.adminUsers.updateAccess(id, body);
  }
}
