import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { DialoguesModule } from '../dialogues/dialogues.module';
import { StudioModule } from '../studio/studio.module';
import { WorksModule } from '../works/works.module';
import { CurationController } from './curation.controller';

@Module({
  imports: [ArticlesModule, DialoguesModule, StudioModule, WorksModule],
  controllers: [CurationController],
})
export class CurationModule {}
