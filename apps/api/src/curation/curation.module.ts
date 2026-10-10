import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { DialoguesModule } from '../dialogues/dialogues.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { ProjectsModule } from '../projects/projects.module';
import { StudioModule } from '../studio/studio.module';
import { WorksModule } from '../works/works.module';
import { CurationController } from './curation.controller';

@Module({
  imports: [
    ArticlesModule,
    DialoguesModule,
    ProfilesModule,
    ProjectsModule,
    StudioModule,
    WorksModule,
  ],
  controllers: [CurationController],
})
export class CurationModule {}
