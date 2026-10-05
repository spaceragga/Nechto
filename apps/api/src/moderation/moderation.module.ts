import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { DialoguesModule } from '../dialogues/dialogues.module';
import { StudioModule } from '../studio/studio.module';
import { ModerationController } from './moderation.controller';

@Module({
  imports: [ArticlesModule, DialoguesModule, StudioModule],
  controllers: [ModerationController],
})
export class ModerationModule {}
