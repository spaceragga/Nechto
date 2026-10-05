import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { StudioController } from './studio.controller';
import { StudioService } from './studio.service';

@Module({
  imports: [StorageModule],
  controllers: [StudioController],
  providers: [StudioService],
  exports: [StudioService],
})
export class StudioModule {}
