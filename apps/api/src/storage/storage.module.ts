import { Module } from '@nestjs/common';
import { LocalDiskStorageService } from './local-disk-storage.service';
import { STORAGE_SERVICE, StorageService } from './storage.service';

@Module({
  providers: [
    LocalDiskStorageService,
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
