import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  createProjectFieldsSchema,
  cursorPageQuerySchema,
  listPublishedProjectsQuerySchema,
  replaceProjectBlocksSchema,
  updateProjectFieldsSchema,
  type CreateProjectFields,
  type CursorPageQuery,
  type ListPublishedProjectsQuery,
  type ReplaceProjectBlocks,
  type UpdateProjectFields,
} from '@nechto/api-contract';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  listMine(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(cursorPageQuerySchema))
    query: CursorPageQuery,
  ) {
    return this.projectsService.listMine(user.id, query);
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard)
  getMine(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.projectsService.getMine(user.id, id);
  }

  @Get('profile/:slug')
  listBySlug(
    @Param('slug') slug: string,
    @Query(new ZodValidationPipe(cursorPageQuerySchema))
    query: CursorPageQuery,
  ) {
    return this.projectsService.listPublishedBySlug(slug, query);
  }

  @Get()
  listPublished(
    @Query(new ZodValidationPipe(listPublishedProjectsQuerySchema))
    query: ListPublishedProjectsQuery,
  ) {
    return this.projectsService.listPublished(query);
  }

  @Get(':id')
  getPublished(@Param('id') id: string) {
    return this.projectsService.getPublishedById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createMine(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createProjectFieldsSchema))
    fields: CreateProjectFields,
  ) {
    return this.projectsService.createMine(user.id, fields);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateMine(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProjectFieldsSchema))
    fields: UpdateProjectFields,
  ) {
    return this.projectsService.updateMine(user.id, id, fields);
  }

  @Put(':id/blocks')
  @UseGuards(JwtAuthGuard)
  replaceBlocks(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(replaceProjectBlocksSchema))
    body: ReplaceProjectBlocks,
  ) {
    return this.projectsService.replaceBlocks(user.id, id, body.blocks);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  deleteMine(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.projectsService.deleteMine(user.id, id);
  }
}
