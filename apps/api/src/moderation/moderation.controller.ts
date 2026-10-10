import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import type {
  ArticleSummary,
  DialogueSummary,
  ModerationDesk,
  StudioProfileSummary,
  WorkWithAuthor,
} from '@nechto/api-contract';
import { RequiresModerator } from '../auth/requires-access';
import { ArticlesService } from '../articles/articles.service';
import { DialoguesService } from '../dialogues/dialogues.service';
import { StudioService } from '../studio/studio.service';
import { WorksService } from '../works/works.service';

@Controller('moderation')
export class ModerationController {
  constructor(
    private readonly articles: ArticlesService,
    private readonly dialogues: DialoguesService,
    private readonly studio: StudioService,
    private readonly works: WorksService,
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
      liveStudio,
      hiddenStudio,
    ] = await Promise.all([
      this.works.listLiveForModeration(),
      this.works.listHiddenForModeration(),
      this.articles.listForCuration(),
      this.articles.listHidden(),
      this.dialogues.listLive(),
      this.dialogues.listHidden(),
      this.studio.listLiveForModeration(),
      this.studio.listHiddenForModeration(),
    ]);
    return {
      reports: [],
      liveWorks,
      hiddenWorks,
      liveArticles,
      hiddenArticles,
      liveDialogues,
      hiddenDialogues,
      liveStudio,
      hiddenStudio,
    };
  }

  @Post('works/:id/hide')
  @RequiresModerator()
  hideWork(@Param('id') id: string): Promise<WorkWithAuthor> {
    return this.works.hide(id);
  }

  @Post('works/:id/unhide')
  @RequiresModerator()
  @HttpCode(200)
  unhideWork(@Param('id') id: string): Promise<WorkWithAuthor> {
    return this.works.unhide(id);
  }

  @Post('articles/:id/hide')
  @RequiresModerator()
  hideArticle(@Param('id') id: string): Promise<ArticleSummary> {
    return this.articles.hide(id);
  }

  @Post('articles/:id/unhide')
  @RequiresModerator()
  @HttpCode(200)
  unhideArticle(@Param('id') id: string): Promise<ArticleSummary> {
    return this.articles.unhide(id);
  }

  @Post('dialogues/:id/hide')
  @RequiresModerator()
  hideDialogue(@Param('id') id: string): Promise<DialogueSummary> {
    return this.dialogues.hide(id);
  }

  @Post('dialogues/:id/unhide')
  @RequiresModerator()
  @HttpCode(200)
  unhideDialogue(@Param('id') id: string): Promise<DialogueSummary> {
    return this.dialogues.unhide(id);
  }

  @Post('studio/:profileId/hide')
  @RequiresModerator()
  hideStudioProfile(
    @Param('profileId') profileId: string,
  ): Promise<StudioProfileSummary> {
    return this.studio.hide(profileId);
  }

  @Post('studio/:profileId/unhide')
  @RequiresModerator()
  @HttpCode(200)
  unhideStudioProfile(
    @Param('profileId') profileId: string,
  ): Promise<StudioProfileSummary> {
    return this.studio.unhide(profileId);
  }
}
