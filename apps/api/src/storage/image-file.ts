import { HttpStatus } from '@nestjs/common';
import { extname } from 'node:path';
import type { ApiErrorCode } from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_BYTES,
  type AvatarMimeType,
} from '../config/avatar-limits';

export type ImageFileError = {
  code: ApiErrorCode;
  message: string;
};

export type ImageFileErrors = {
  required: ImageFileError;
  tooLarge: ImageFileError;
  invalidType: ImageFileError;
};

export function extensionForImageMime(mimeType: string): string {
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

export function assertImageFile(
  file: Express.Multer.File | undefined,
  errors: ImageFileErrors,
): Express.Multer.File {
  if (!file) {
    throw new ApiHttpException(
      HttpStatus.BAD_REQUEST,
      errors.required.code,
      errors.required.message,
    );
  }

  if (file.size > AVATAR_MAX_BYTES) {
    throw new ApiHttpException(
      HttpStatus.BAD_REQUEST,
      errors.tooLarge.code,
      errors.tooLarge.message,
    );
  }

  if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.mimetype as AvatarMimeType)) {
    throw new ApiHttpException(
      HttpStatus.BAD_REQUEST,
      errors.invalidType.code,
      errors.invalidType.message,
    );
  }

  return file;
}
