import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { WorksController } from './works.controller';
import { WorksService } from './works.service';

@Module({
  imports: [StorageModule],
  controllers: [WorksController],
  providers: [WorksService],
})
export class WorksModule {}
