import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  createReportSchema,
  type CreateReportDto,
  type CreateReportResponse,
} from '@nechto/api-contract';
import {
  OptionalUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  create(
    @Body(new ZodValidationPipe(createReportSchema)) body: CreateReportDto,
    @OptionalUser() user: AuthUser | null,
  ): Promise<CreateReportResponse> {
    return this.reports.create(body, user);
  }
}
