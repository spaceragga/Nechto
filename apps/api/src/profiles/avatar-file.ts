import { API_ERROR_CODES } from '@nechto/api-contract';
import {
  assertImageFile,
  extensionForImageMime,
  type ImageFileErrors,
} from '../storage/image-file';

const AVATAR_FILE_ERRORS: ImageFileErrors = {
  required: {
    code: API_ERROR_CODES.AVATAR_REQUIRED,
    message: 'Avatar file is required',
  },
  tooLarge: {
    code: API_ERROR_CODES.AVATAR_TOO_LARGE,
    message: 'Avatar file is too large',
  },
  invalidType: {
    code: API_ERROR_CODES.AVATAR_INVALID_TYPE,
    message: 'Avatar must be JPEG, PNG, or WebP',
  },
};

export function assertAvatarFile(
  file: Express.Multer.File | undefined,
): Express.Multer.File {
  return assertImageFile(file, AVATAR_FILE_ERRORS);
}

export { extensionForImageMime as extensionForAvatarMime };
