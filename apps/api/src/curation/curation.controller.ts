import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import type { ArticleSummary, CurationDesk } from '@nechto/api-contract';
import { RequiresCurator } from '../auth/requires-access';
import { ArticlesService } from '../articles/articles.service';

@Controller('curation')
export class CurationController {
  constructor(private readonly articles: ArticlesService) {}

  @Get('desk')
  @RequiresCurator()
  async desk(): Promise<CurationDesk> {
    const issues = await this.articles.listForCuration();
    return {
      pairings: [],
      hangings: [],
      issues,
      channels: [],
      featuredArticle: issues.find((item) => item.featuredAt) ?? null,
    };
  }

  @Post('articles/:id/feature')
  @RequiresCurator()
  feature(@Param('id') id: string): Promise<ArticleSummary> {
    return this.articles.feature(id);
  }

  @Delete('articles/:id/feature')
  @RequiresCurator()
  @HttpCode(200)
  unfeature(@Param('id') id: string): Promise<ArticleSummary> {
    return this.articles.unfeature(id);
  }
}
