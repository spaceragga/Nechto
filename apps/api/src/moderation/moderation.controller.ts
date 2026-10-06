import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import type {
  ArticleSummary,
  DialogueSummary,
  ModerationDesk,
  StudioProfileSummary,
} from '@nechto/api-contract';
import { RequiresModerator } from '../auth/requires-access';
import { ArticlesService } from '../articles/articles.service';
import { DialoguesService } from '../dialogues/dialogues.service';
import { StudioService } from '../studio/studio.service';

@Controller('moderation')
export class ModerationController {
  constructor(
    private readonly articles: ArticlesService,
    private readonly dialogues: DialoguesService,
    private readonly studio: StudioService,
  ) {}

  @Get('desk')
  @RequiresModerator()
  async desk(): Promise<ModerationDesk> {
    const [
      liveArticles,
      hiddenArticles,
      liveDialogues,
      hiddenDialogues,
      liveStudio,
      hiddenStudio,
    ] = await Promise.all([
      this.articles.listForCuration(),
      this.articles.listHidden(),
      this.dialogues.listLive(),
      this.dialogues.listHidden(),
      this.studio.listLiveForModeration(),
      this.studio.listHiddenForModeration(),
    ]);
    return {
      reports: [],
      hiddenWorks: [],
      liveArticles,
      hiddenArticles,
      liveDialogues,
      hiddenDialogues,
      liveStudio,
      hiddenStudio,
    };
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
