import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  cursorPageQuerySchema,
  type CursorPageQuery,
} from '@nechto/api-contract';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { DialoguesService } from './dialogues.service';

@Controller('dialogues')
export class DialoguesController {
  constructor(private readonly dialoguesService: DialoguesService) {}

  @Get()
  listPublished(
    @Query(new ZodValidationPipe(cursorPageQuerySchema))
    query: CursorPageQuery,
  ) {
    return this.dialoguesService.listPublished(query);
  }

  @Get(':id')
  getPublished(@Param('id') id: string) {
    return this.dialoguesService.getPublishedById(id);
  }
}
