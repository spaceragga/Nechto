import { HttpStatus } from '@nestjs/common';
import { extname } from 'node:path';
import { API_ERROR_CODES } from '@nechto/api-contract';
import sharp from 'sharp';
import { ApiHttpException } from '../common/errors/api-http-exception';
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_BYTES,
  type AvatarMimeType,
} from '../config/avatar-limits';

export function assertAvatarFile(
  file: Express.Multer.File | undefined,
): Express.Multer.File {
  if (!file) {
    throw new ApiHttpException(
      HttpStatus.BAD_REQUEST,
      API_ERROR_CODES.AVATAR_REQUIRED,
      'Avatar file is required',
    );
  }

  if (file.size > AVATAR_MAX_BYTES) {
    throw new ApiHttpException(
      HttpStatus.PAYLOAD_TOO_LARGE,
      API_ERROR_CODES.AVATAR_TOO_LARGE,
      'Avatar file is too large',
    );
  }

  if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.mimetype as AvatarMimeType)) {
    throw new ApiHttpException(
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      API_ERROR_CODES.AVATAR_INVALID_TYPE,
      'Avatar must be JPEG, PNG, or WebP',
    );
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

export type NormalizedAvatar = {
  body: Buffer;
  contentType: 'image/webp';
  extension: '.webp';
};

export async function normalizeAvatarFile(
  file: Express.Multer.File | undefined,
): Promise<NormalizedAvatar> {
  const avatar = assertAvatarFile(file);

  try {
    const image = sharp(avatar.buffer, {
      failOn: 'warning',
      limitInputPixels: 16_000_000,
    });
    const metadata = await image.metadata();
    if (
      !metadata.width ||
      !metadata.height ||
      !metadata.format ||
      !['jpeg', 'png', 'webp'].includes(metadata.format)
    ) {
      throw new Error('Image dimensions are missing');
    }

    const body = await image
      .rotate()
      .resize({
        width: 2048,
        height: 2048,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    return {
      body,
      contentType: 'image/webp',
      extension: '.webp',
    };
  } catch {
    throw new ApiHttpException(
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      API_ERROR_CODES.AVATAR_INVALID_TYPE,
      'Avatar must be a valid JPEG, PNG, or WebP image',
    );
  }
}
