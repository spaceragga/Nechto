import { Module } from '@nestjs/common';
import { CurationController } from './curation.controller';

@Module({
  controllers: [CurationController],
})
export class CurationModule {}
