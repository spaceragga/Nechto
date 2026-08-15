import { Module } from '@nestjs/common';
import { env } from '../config/env';
import { LocalDiskStorageService } from './local-disk-storage.service';
import { S3StorageService } from './s3-storage.service';
import { STORAGE_SERVICE, StorageService } from './storage.service';

const storageProvider = {
  provide: StorageService,
  useFactory: () =>
    env.STORAGE_DRIVER === 's3'
      ? new S3StorageService()
      : new LocalDiskStorageService(),
};

@Module({
  providers: [
    storageProvider,
    {
      provide: STORAGE_SERVICE,
      useExisting: StorageService,
    },
  ],
  exports: [StorageService, STORAGE_SERVICE],
})
export class StorageModule {}
