import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { DialoguesModule } from '../dialogues/dialogues.module';
import { StudioModule } from '../studio/studio.module';
import { WorksModule } from '../works/works.module';
import { ModerationController } from './moderation.controller';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [ArticlesModule, DialoguesModule, StudioModule, WorksModule],
  controllers: [ModerationController, ReportsController],
  providers: [ReportsService],
})
export class ModerationModule {}
