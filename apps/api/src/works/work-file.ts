import { API_ERROR_CODES } from '@nechto/api-contract';
import { assertImageFile, type ImageFileErrors } from '../storage/image-file';

const WORK_FILE_ERRORS: ImageFileErrors = {
  required: {
    code: API_ERROR_CODES.WORK_FILE_REQUIRED,
    message: 'Work file is required',
  },
  tooLarge: {
    code: API_ERROR_CODES.WORK_FILE_TOO_LARGE,
    message: 'Work file is too large',
  },
  invalidType: {
    code: API_ERROR_CODES.WORK_INVALID_TYPE,
    message: 'Work must be JPEG, PNG, or WebP',
  },
};

export function assertWorkFile(
  file: Express.Multer.File | undefined,
): Express.Multer.File {
  return assertImageFile(file, WORK_FILE_ERRORS);
}
