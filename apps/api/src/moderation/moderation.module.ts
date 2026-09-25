import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { ModerationController } from './moderation.controller';

@Module({
  imports: [ArticlesModule],
  controllers: [ModerationController],
})
export class ModerationModule {}
