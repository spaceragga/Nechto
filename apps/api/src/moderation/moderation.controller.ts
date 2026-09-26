import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import type { ArticleSummary, ModerationDesk } from '@nechto/api-contract';
import { RequiresModerator } from '../auth/requires-access';
import { ArticlesService } from '../articles/articles.service';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly articles: ArticlesService) {}

  @Get('desk')
  @RequiresModerator()
  async desk(): Promise<ModerationDesk> {
    const [liveArticles, hiddenArticles] = await Promise.all([
      this.articles.listForCuration(),
      this.articles.listHidden(),
    ]);
    return {
      reports: [],
      hiddenWorks: [],
      liveArticles,
      hiddenArticles,
    };
  }

  @Post('articles/:id/hide')
  @RequiresModerator()
  hide(@Param('id') id: string): Promise<ArticleSummary> {
    return this.articles.hide(id);
  }

  @Post('articles/:id/unhide')
  @RequiresModerator()
  @HttpCode(200)
  unhide(@Param('id') id: string): Promise<ArticleSummary> {
    return this.articles.unhide(id);
  }
}
