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
  type ProjectSummary,
  type PublicProfileWithWorks,
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
import { ProfilesService } from '../profiles/profiles.service';
import { ProjectsService } from '../projects/projects.service';
import { StudioService } from '../studio/studio.service';
import { WorksService } from '../works/works.service';

@Controller('curation')
export class CurationController {
  constructor(
    private readonly articles: ArticlesService,
    private readonly dialogues: DialoguesService,
    private readonly profiles: ProfilesService,
    private readonly projects: ProjectsService,
    private readonly studio: StudioService,
    private readonly works: WorksService,
  ) {}

  @Get('desk')
  @RequiresCurator()
  async desk(): Promise<CurationDesk> {
    const [
      issues,
      pairings,
      hangings,
      channels,
      creators,
      studioListed,
      studioCandidates,
      featuredBillboard,
    ] = await Promise.all([
      this.articles.listForCuration(),
      this.dialogues.listForCuration(),
      this.works.listHangings(),
      this.projects.listForCuration(),
      this.profiles.listForHomeCuration(),
      this.studio.listListedForCuration(),
      this.studio.listCandidatesForCuration(),
      this.works.getBillboard(),
    ]);
    return {
      pairings,
      hangings,
      issues,
      channels,
      creators,
      featuredArticle: issues.find((item) => item.featuredAt) ?? null,
      featuredDialogue: pairings.find((item) => item.featuredAt) ?? null,
      featuredBillboard,
      featuredCreator: creators.find((item) => item.homeFeaturedAt) ?? null,
      selectionCreators: creators.filter((item) => item.homeSelectionAt),
      featuredChannel: channels.find((item) => item.featuredAt) ?? null,
      studioListed,
      studioCandidates,
      featuredStudio:
        studioListed.find((item) => item.studioFeaturedAt) ?? null,
    };
  }

  @Post('works/:id/feature')
  @RequiresCurator()
  featureBillboard(@Param('id') id: string): Promise<WorkWithAuthor> {
    return this.works.featureBillboard(id);
  }

  @Delete('works/:id/feature')
  @RequiresCurator()
  @HttpCode(200)
  unfeatureBillboard(@Param('id') id: string): Promise<WorkWithAuthor> {
    return this.works.unfeatureBillboard(id);
  }

  @Post('works/:id/hang')
  @RequiresCurator()
  hangWork(@Param('id') id: string): Promise<WorkWithAuthor> {
    return this.works.hang(id);
  }

  @Delete('works/:id/hang')
  @RequiresCurator()
  @HttpCode(200)
  unhangWork(@Param('id') id: string): Promise<WorkWithAuthor> {
    return this.works.unhang(id);
  }

  @Post('profiles/:slug/feature-home')
  @RequiresCurator()
  featureHomeCreator(
    @Param('slug') slug: string,
  ): Promise<PublicProfileWithWorks> {
    return this.profiles.featureHome(slug);
  }

  @Delete('profiles/:slug/feature-home')
  @RequiresCurator()
  @HttpCode(200)
  unfeatureHomeCreator(
    @Param('slug') slug: string,
  ): Promise<PublicProfileWithWorks> {
    return this.profiles.unfeatureHome(slug);
  }

  @Post('profiles/:slug/select-home')
  @RequiresCurator()
  selectHomeCreator(
    @Param('slug') slug: string,
  ): Promise<PublicProfileWithWorks> {
    return this.profiles.selectHome(slug);
  }

  @Delete('profiles/:slug/select-home')
  @RequiresCurator()
  @HttpCode(200)
  unselectHomeCreator(
    @Param('slug') slug: string,
  ): Promise<PublicProfileWithWorks> {
    return this.profiles.unselectHome(slug);
  }

  @Post('projects/:id/feature')
  @RequiresCurator()
  featureChannel(@Param('id') id: string): Promise<ProjectSummary> {
    return this.projects.feature(id);
  }

  @Delete('projects/:id/feature')
  @RequiresCurator()
  @HttpCode(200)
  unfeatureChannel(@Param('id') id: string): Promise<ProjectSummary> {
    return this.projects.unfeature(id);
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
