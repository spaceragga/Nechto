import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { DialoguesModule } from '../dialogues/dialogues.module';
import { ModerationController } from './moderation.controller';

@Module({
  imports: [ArticlesModule, DialoguesModule],
  controllers: [ModerationController],
})
export class ModerationModule {}
