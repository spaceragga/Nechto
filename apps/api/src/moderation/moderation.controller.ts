import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import type {
  ArticleSummary,
  ContentReport,
  DialogueSummary,
  ModerationActionKind,
  ModerationDesk,
  ModerationProfileSummary,
  ModerationTargetType,
  ProjectSummary,
  StudioProfileSummary,
  WorkWithAuthor,
} from '@nechto/api-contract';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { RequiresModerator } from '../auth/requires-access';
import { ArticlesService } from '../articles/articles.service';
import { DialoguesService } from '../dialogues/dialogues.service';
import { ProfilesService } from '../profiles/profiles.service';
import { ProjectsService } from '../projects/projects.service';
import { StudioService } from '../studio/studio.service';
import { WorksService } from '../works/works.service';
import { ModerationAuditService } from './moderation-audit.service';
import { ReportsService } from './reports.service';

@Controller('moderation')
export class ModerationController {
  constructor(
    private readonly articles: ArticlesService,
    private readonly dialogues: DialoguesService,
    private readonly profiles: ProfilesService,
    private readonly projects: ProjectsService,
    private readonly reports: ReportsService,
    private readonly studio: StudioService,
    private readonly works: WorksService,
    private readonly audit: ModerationAuditService,
  ) {}

  @Get('desk')
  @RequiresModerator()
  async desk(): Promise<ModerationDesk> {
    const [
      liveWorks,
      hiddenWorks,
      liveArticles,
      hiddenArticles,
      liveDialogues,
      hiddenDialogues,
      liveProjects,
      hiddenProjects,
      liveProfiles,
      hiddenProfiles,
      liveStudio,
      hiddenStudio,
      reports,
      recentActions,
    ] = await Promise.all([
      this.works.listLiveForModeration(),
      this.works.listHiddenForModeration(),
      this.articles.listForCuration(),
      this.articles.listHidden(),
      this.dialogues.listLive(),
      this.dialogues.listHidden(),
      this.projects.listLiveForModeration(),
      this.projects.listHiddenForModeration(),
      this.profiles.listLiveForModeration(),
      this.profiles.listHiddenForModeration(),
      this.studio.listLiveForModeration(),
      this.studio.listHiddenForModeration(),
      this.reports.listForDesk(),
      this.audit.listRecent(),
    ]);
    return {
      reports,
      liveWorks,
      hiddenWorks,
      liveArticles,
      hiddenArticles,
      liveDialogues,
      hiddenDialogues,
      liveProjects,
      hiddenProjects,
      liveProfiles,
      hiddenProfiles,
      liveStudio,
      hiddenStudio,
      recentActions,
    };
  }

  @Post('works/:id/hide')
  @RequiresModerator()
  hideWork(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<WorkWithAuthor> {
    return this.withAudit(user, 'hide_work', 'work', id, () =>
      this.works.hide(id),
    );
  }

  @Post('works/:id/unhide')
  @RequiresModerator()
  @HttpCode(200)
  unhideWork(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<WorkWithAuthor> {
    return this.withAudit(user, 'unhide_work', 'work', id, () =>
      this.works.unhide(id),
    );
  }

  @Post('articles/:id/hide')
  @RequiresModerator()
  hideArticle(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<ArticleSummary> {
    return this.withAudit(user, 'hide_article', 'article', id, () =>
      this.articles.hide(id),
    );
  }

  @Post('articles/:id/unhide')
  @RequiresModerator()
  @HttpCode(200)
  unhideArticle(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<ArticleSummary> {
    return this.withAudit(user, 'unhide_article', 'article', id, () =>
      this.articles.unhide(id),
    );
  }

  @Post('dialogues/:id/hide')
  @RequiresModerator()
  hideDialogue(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<DialogueSummary> {
    return this.withAudit(user, 'hide_dialogue', 'dialogue', id, () =>
      this.dialogues.hide(id),
    );
  }

  @Post('dialogues/:id/unhide')
  @RequiresModerator()
  @HttpCode(200)
  unhideDialogue(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<DialogueSummary> {
    return this.withAudit(user, 'unhide_dialogue', 'dialogue', id, () =>
      this.dialogues.unhide(id),
    );
  }

  @Post('projects/:id/hide')
  @RequiresModerator()
  hideProject(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<ProjectSummary> {
    return this.withAudit(user, 'hide_project', 'project', id, () =>
      this.projects.hide(id),
    );
  }

  @Post('projects/:id/unhide')
  @RequiresModerator()
  @HttpCode(200)
  unhideProject(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<ProjectSummary> {
    return this.withAudit(user, 'unhide_project', 'project', id, () =>
      this.projects.unhide(id),
    );
  }

  @Post('profiles/:profileId/hide')
  @RequiresModerator()
  hideProfile(
    @CurrentUser() user: AuthUser,
    @Param('profileId') profileId: string,
  ): Promise<ModerationProfileSummary> {
    return this.withAudit(user, 'hide_profile', 'profile', profileId, () =>
      this.profiles.hide(profileId),
    );
  }

  @Post('profiles/:profileId/unhide')
  @RequiresModerator()
  @HttpCode(200)
  unhideProfile(
    @CurrentUser() user: AuthUser,
    @Param('profileId') profileId: string,
  ): Promise<ModerationProfileSummary> {
    return this.withAudit(user, 'unhide_profile', 'profile', profileId, () =>
      this.profiles.unhide(profileId),
    );
  }

  @Post('studio/:profileId/hide')
  @RequiresModerator()
  hideStudioProfile(
    @CurrentUser() user: AuthUser,
    @Param('profileId') profileId: string,
  ): Promise<StudioProfileSummary> {
    return this.withAudit(user, 'hide_studio', 'studio', profileId, () =>
      this.studio.hide(profileId),
    );
  }

  @Post('studio/:profileId/unhide')
  @RequiresModerator()
  @HttpCode(200)
  unhideStudioProfile(
    @CurrentUser() user: AuthUser,
    @Param('profileId') profileId: string,
  ): Promise<StudioProfileSummary> {
    return this.withAudit(user, 'unhide_studio', 'studio', profileId, () =>
      this.studio.unhide(profileId),
    );
  }

  @Post('reports/:id/resolve')
  @RequiresModerator()
  @HttpCode(200)
  resolveReport(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<ContentReport> {
    return this.reports.resolve(id, user.id);
  }

  private async withAudit<T>(
    user: AuthUser,
    action: ModerationActionKind,
    targetType: ModerationTargetType,
    targetId: string,
    run: () => Promise<T>,
  ): Promise<T> {
    const result = await run();
    await this.audit.record({
      actorId: user.id,
      action,
      targetType,
      targetId,
    });
    return result;
  }
}
