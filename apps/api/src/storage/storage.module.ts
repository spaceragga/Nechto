import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LocalDiskStorageService } from './local-disk-storage.service';
import { STORAGE_SERVICE, StorageService } from './storage.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [AuthModule],
  controllers: [UploadsController],
  providers: [
    LocalDiskStorageService,
    UploadsService,
    {
      provide: STORAGE_SERVICE,
      useExisting: LocalDiskStorageService,
    },
    {
      provide: StorageService,
      useExisting: LocalDiskStorageService,
    },
  ],
  exports: [StorageService, STORAGE_SERVICE, LocalDiskStorageService],
})
export class StorageModule {}
