import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  createArticleFieldsSchema,
  cursorPageQuerySchema,
  updateArticleFieldsSchema,
  type CreateArticleFields,
  type CursorPageQuery,
  type UpdateArticleFields,
} from '@nechto/api-contract';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  listMine(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(cursorPageQuerySchema))
    query: CursorPageQuery,
  ) {
    return this.articlesService.listMine(user.id, query);
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard)
  getMine(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.articlesService.getMine(user.id, id);
  }

  @Get()
  listPublished(
    @Query(new ZodValidationPipe(cursorPageQuerySchema))
    query: CursorPageQuery,
  ) {
    return this.articlesService.listPublished(query);
  }

  @Get('profile/:slug')
  listBySlug(
    @Param('slug') slug: string,
    @Query(new ZodValidationPipe(cursorPageQuerySchema))
    query: CursorPageQuery,
  ) {
    return this.articlesService.listPublishedBySlug(slug, query);
  }

  @Get(':id')
  getPublished(@Param('id') id: string) {
    return this.articlesService.getPublishedById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createMine(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createArticleFieldsSchema))
    fields: CreateArticleFields,
  ) {
    return this.articlesService.createMine(user.id, fields);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateMine(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateArticleFieldsSchema))
    fields: UpdateArticleFields,
  ) {
    return this.articlesService.updateMine(user.id, id, fields);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  publishMine(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.articlesService.publishMine(user.id, id);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  unpublishMine(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.articlesService.unpublishMine(user.id, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  deleteMine(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.articlesService.deleteMine(user.id, id);
  }
}
