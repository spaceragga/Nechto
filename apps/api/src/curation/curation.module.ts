import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { DialoguesModule } from '../dialogues/dialogues.module';
import { CurationController } from './curation.controller';

@Module({
  imports: [ArticlesModule, DialoguesModule],
  controllers: [CurationController],
})
export class CurationModule {}
