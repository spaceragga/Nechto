import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  cursorPageQuerySchema,
  type CursorPageQuery,
} from '@nechto/api-contract';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { StudioService } from './studio.service';

@Controller('studio')
export class StudioController {
  constructor(private readonly studio: StudioService) {}

  @Get()
  listPublic(
    @Query(new ZodValidationPipe(cursorPageQuerySchema))
    query: CursorPageQuery,
  ) {
    return this.studio.listPublic(query);
  }

  @Get(':slug')
  getPublicBySlug(@Param('slug') slug: string) {
    return this.studio.getPublicBySlug(slug);
  }
}
