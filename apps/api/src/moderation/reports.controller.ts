import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  reportProfileSchema,
  type ReportProfileDto,
} from '@nechto/api-contract';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ModerationService } from './moderation.service';

@Controller('profiles/slug/:slug/report')
export class ReportsController {
  constructor(private readonly moderation: ModerationService) {}

  @Post()
  @HttpCode(202)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async create(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(reportProfileSchema)) dto: ReportProfileDto,
  ) {
    await this.moderation.reportProfile(slug, dto);
    return { ok: true };
  }
}
