import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  updateStaffAccessSchema,
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
  list(): Promise<StaffUserList> {
    return this.adminUsers.list();
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
