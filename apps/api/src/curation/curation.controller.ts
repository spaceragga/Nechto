import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  createDialogueFieldsSchema,
  updateDialogueFieldsSchema,
  type ArticleSummary,
  type CreateDialogueFields,
  type CurationDesk,
  type DialogueSummary,
  type UpdateDialogueFields,
} from '@nechto/api-contract';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { RequiresCurator } from '../auth/requires-access';
import { ArticlesService } from '../articles/articles.service';
import { DialoguesService } from '../dialogues/dialogues.service';

@Controller('curation')
export class CurationController {
  constructor(
    private readonly articles: ArticlesService,
    private readonly dialogues: DialoguesService,
  ) {}

  @Get('desk')
  @RequiresCurator()
  async desk(): Promise<CurationDesk> {
    const [issues, pairings] = await Promise.all([
      this.articles.listForCuration(),
      this.dialogues.listForCuration(),
    ]);
    return {
      pairings,
      hangings: [],
      issues,
      channels: [],
      featuredArticle: issues.find((item) => item.featuredAt) ?? null,
      featuredDialogue: pairings.find((item) => item.featuredAt) ?? null,
    };
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
