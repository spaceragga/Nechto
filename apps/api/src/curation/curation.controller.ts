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
} from '@nestjs/common';
import {
  createDialogueFieldsSchema,
  listCurationWorksQuerySchema,
  updateDialogueFieldsSchema,
  type ArticleSummary,
  type CreateDialogueFields,
  type CurationDesk,
  type CursorPage,
  type DialogueSummary,
  type ListCurationWorksQuery,
  type StudioProfileSummary,
  type UpdateDialogueFields,
  type WorkWithAuthor,
} from '@nechto/api-contract';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { RequiresCurator } from '../auth/requires-access';
import { ArticlesService } from '../articles/articles.service';
import { DialoguesService } from '../dialogues/dialogues.service';
import { StudioService } from '../studio/studio.service';
import { WorksService } from '../works/works.service';

@Controller('curation')
export class CurationController {
  constructor(
    private readonly articles: ArticlesService,
    private readonly dialogues: DialoguesService,
    private readonly studio: StudioService,
    private readonly works: WorksService,
  ) {}

  @Get('desk')
  @RequiresCurator()
  async desk(): Promise<CurationDesk> {
    const [issues, pairings, studioListed, studioCandidates] =
      await Promise.all([
        this.articles.listForCuration(),
        this.dialogues.listForCuration(),
        this.studio.listListedForCuration(),
        this.studio.listCandidatesForCuration(),
      ]);
    return {
      pairings,
      hangings: [],
      issues,
      channels: [],
      featuredArticle: issues.find((item) => item.featuredAt) ?? null,
      featuredDialogue: pairings.find((item) => item.featuredAt) ?? null,
      studioListed,
      studioCandidates,
      featuredStudio:
        studioListed.find((item) => item.studioFeaturedAt) ?? null,
    };
  }

  @Post('studio/:profileId/list')
  @RequiresCurator()
  listStudio(
    @Param('profileId') profileId: string,
  ): Promise<StudioProfileSummary> {
    return this.studio.list(profileId);
  }

  @Post('studio/:profileId/unlist')
  @RequiresCurator()
  @HttpCode(200)
  unlistStudio(
    @Param('profileId') profileId: string,
  ): Promise<StudioProfileSummary> {
    return this.studio.unlist(profileId);
  }

  @Post('studio/:profileId/feature')
  @RequiresCurator()
  featureStudio(
    @Param('profileId') profileId: string,
  ): Promise<StudioProfileSummary> {
    return this.studio.feature(profileId);
  }

  @Delete('studio/:profileId/feature')
  @RequiresCurator()
  @HttpCode(200)
  unfeatureStudio(
    @Param('profileId') profileId: string,
  ): Promise<StudioProfileSummary> {
    return this.studio.unfeature(profileId);
  }

  @Get('works')
  @RequiresCurator()
  listWorks(
    @Query(new ZodValidationPipe(listCurationWorksQuerySchema))
    query: ListCurationWorksQuery,
  ): Promise<CursorPage<WorkWithAuthor>> {
    return this.works.listForCuration(query);
  }

  @Post('articles/:id/feature')
  @RequiresCurator()
  featureArticle(@Param('id') id: string): Promise<ArticleSummary> {
    return this.articles.feature(id);
  }

  @Delete('articles/:id/feature')
  @RequiresCurator()
  @HttpCode(200)
  unfeatureArticle(@Param('id') id: string): Promise<ArticleSummary> {
    return this.articles.unfeature(id);
  }

  @Post('dialogues')
  @RequiresCurator()
  createDialogue(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createDialogueFieldsSchema))
    fields: CreateDialogueFields,
  ): Promise<DialogueSummary> {
    return this.dialogues.create(user.id, fields);
  }

  @Patch('dialogues/:id')
  @RequiresCurator()
  updateDialogue(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDialogueFieldsSchema))
    fields: UpdateDialogueFields,
  ): Promise<DialogueSummary> {
    return this.dialogues.update(id, fields);
  }

  @Post('dialogues/:id/publish')
  @RequiresCurator()
  @HttpCode(200)
  publishDialogue(@Param('id') id: string): Promise<DialogueSummary> {
    return this.dialogues.publish(id);
  }

  @Post('dialogues/:id/unpublish')
  @RequiresCurator()
  @HttpCode(200)
  unpublishDialogue(@Param('id') id: string): Promise<DialogueSummary> {
    return this.dialogues.unpublish(id);
  }

  @Post('dialogues/:id/feature')
  @RequiresCurator()
  featureDialogue(@Param('id') id: string): Promise<DialogueSummary> {
    return this.dialogues.feature(id);
  }

  @Delete('dialogues/:id/feature')
  @RequiresCurator()
  @HttpCode(200)
  unfeatureDialogue(@Param('id') id: string): Promise<DialogueSummary> {
    return this.dialogues.unfeature(id);
  }

  @Delete('dialogues/:id')
  @RequiresCurator()
  @HttpCode(204)
  deleteDialogue(@Param('id') id: string): Promise<void> {
    return this.dialogues.delete(id);
  }
}
