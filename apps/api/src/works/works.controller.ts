import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  createWorkFieldsSchema,
  cursorPageQuerySchema,
  listPublishedWorksQuerySchema,
  type CreateWorkFields,
  type CursorPageQuery,
  type ListPublishedWorksQuery,
} from '@nechto/api-contract';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { imageUploadInterceptor } from '../storage/image-upload.interceptor';
import { WorksService } from './works.service';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  listMine(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(cursorPageQuerySchema))
    query: CursorPageQuery,
  ) {
    return this.worksService.listMine(user.id, query);
  }

  @Get('profile/:slug')
  listBySlug(
    @Param('slug') slug: string,
    @Query(new ZodValidationPipe(cursorPageQuerySchema))
    query: CursorPageQuery,
  ) {
    return this.worksService.listPublishedBySlug(slug, query);
  }

  @Get()
  listPublished(
    @Query(new ZodValidationPipe(listPublishedWorksQuerySchema))
    query: ListPublishedWorksQuery,
  ) {
    return this.worksService.listPublished(query);
  }

  @Get(':id')
  getPublished(@Param('id') id: string) {
    return this.worksService.getPublishedById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(imageUploadInterceptor())
  createMine(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body(new ZodValidationPipe(createWorkFieldsSchema))
    fields: CreateWorkFields,
  ) {
    return this.worksService.createMine(user.id, file, fields);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  deleteMine(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.worksService.deleteMine(user.id, id);
  }
}
