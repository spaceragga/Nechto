import { HttpStatus } from '@nestjs/common';
import { API_ERROR_CODES } from '@nechto/api-contract';
import sharp from 'sharp';
import { ApiHttpException } from '../common/errors/api-http-exception';

const MAX_WORK_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type NormalizedWorkImage = {
  image: Buffer;
  thumbnail: Buffer;
  width: number;
  height: number;
};

export async function normalizeWorkImage(
  file: Express.Multer.File | undefined,
): Promise<NormalizedWorkImage> {
  if (!file) {
    throw new ApiHttpException(
      HttpStatus.BAD_REQUEST,
      API_ERROR_CODES.AVATAR_REQUIRED,
      'Work image is required',
    );
  }
  if (file.size > MAX_WORK_BYTES) {
    throw new ApiHttpException(
      HttpStatus.PAYLOAD_TOO_LARGE,
      API_ERROR_CODES.AVATAR_TOO_LARGE,
      'Work image is too large',
    );
  }
  if (!ALLOWED_TYPES.has(file.mimetype)) {
    throw invalidImage();
  }

  try {
    const source = sharp(file.buffer, {
      failOn: 'warning',
      limitInputPixels: 40_000_000,
    }).rotate();
    const metadata = await source.metadata();
    if (
      !metadata.width ||
      !metadata.height ||
      !metadata.format ||
      !['jpeg', 'png', 'webp'].includes(metadata.format)
    ) {
      throw new Error('Invalid image metadata');
    }

    const image = await source
      .clone()
      .resize({
        width: 3000,
        height: 3000,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer({ resolveWithObject: true });
    const thumbnail = await source
      .resize({ width: 800, height: 800, fit: 'inside' })
      .webp({ quality: 80 })
      .toBuffer();

    return {
      image: image.data,
      thumbnail,
      width: image.info.width,
      height: image.info.height,
    };
  } catch (error) {
    if (error instanceof ApiHttpException) {
      throw error;
    }
    throw invalidImage();
  }
}

function invalidImage(): ApiHttpException {
  return new ApiHttpException(
    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    API_ERROR_CODES.AVATAR_INVALID_TYPE,
    'Work must be a valid JPEG, PNG, or WebP image',
  );
}
