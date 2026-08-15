import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { reviewReportSchema, type ReviewReportDto } from '@nechto/api-contract';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { ModerationService } from './moderation.service';

@Controller('admin/moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminModerationController {
  constructor(private readonly moderation: ModerationService) {}

  @Get('reports')
  listReports() {
    return this.moderation.listOpenReports();
  }

  @Patch('reports/:id')
  @HttpCode(204)
  async review(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(reviewReportSchema)) dto: ReviewReportDto,
  ) {
    await this.moderation.review(user.id, id, dto);
  }
}
