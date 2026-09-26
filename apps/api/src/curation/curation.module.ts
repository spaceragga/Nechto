import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { CurationController } from './curation.controller';

@Module({
  imports: [ArticlesModule],
  controllers: [CurationController],
})
export class CurationModule {}
