import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { DialoguesModule } from '../dialogues/dialogues.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { ProjectsModule } from '../projects/projects.module';
import { StudioModule } from '../studio/studio.module';
import { WorksModule } from '../works/works.module';
import { ModerationAuditService } from './moderation-audit.service';
import { ModerationController } from './moderation.controller';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    ArticlesModule,
    DialoguesModule,
    ProfilesModule,
    ProjectsModule,
    StudioModule,
    WorksModule,
  ],
  controllers: [ModerationController, ReportsController],
  providers: [ReportsService, ModerationAuditService],
})
export class ModerationModule {}
