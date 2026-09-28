import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { DialoguesController } from './dialogues.controller';
import { DialoguesService } from './dialogues.service';

@Module({
  imports: [StorageModule],
  controllers: [DialoguesController],
  providers: [DialoguesService],
  exports: [DialoguesService],
})
export class DialoguesModule {}
