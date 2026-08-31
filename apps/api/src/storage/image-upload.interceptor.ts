import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AVATAR_MAX_BYTES } from '../config/avatar-limits';

export function imageUploadInterceptor(fieldName = 'file') {
  return FileInterceptor(fieldName, {
    storage: memoryStorage(),
    limits: { fileSize: AVATAR_MAX_BYTES },
  });
}
