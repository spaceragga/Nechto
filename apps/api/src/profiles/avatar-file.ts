import { BadRequestException } from '@nestjs/common';
import { extname } from 'node:path';
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_BYTES,
  type AvatarMimeType,
} from '../config/avatar-limits';

export function assertAvatarFile(
  file: Express.Multer.File | undefined,
): Express.Multer.File {
  if (!file) {
    throw new BadRequestException('Avatar file is required');
  }

  if (file.size > AVATAR_MAX_BYTES) {
    throw new BadRequestException('Avatar file is too large');
  }

  if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.mimetype as AvatarMimeType)) {
    throw new BadRequestException('Avatar must be JPEG, PNG, or WebP');
  }

  return file;
}

export function extensionForAvatarMime(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    default:
      return extname(mimeType) || '.bin';
  }
}
