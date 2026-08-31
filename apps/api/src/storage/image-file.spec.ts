import { API_ERROR_CODES } from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { AVATAR_MAX_BYTES } from '../config/avatar-limits';
import { assertImageFile, extensionForImageMime } from './image-file';

const errors = {
  required: {
    code: API_ERROR_CODES.AVATAR_REQUIRED,
    message: 'required',
  },
  tooLarge: {
    code: API_ERROR_CODES.AVATAR_TOO_LARGE,
    message: 'too large',
  },
  invalidType: {
    code: API_ERROR_CODES.AVATAR_INVALID_TYPE,
    message: 'invalid type',
  },
};

function file(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'photo.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 4,
    buffer: Buffer.from([1, 2, 3, 4]),
    destination: '',
    filename: '',
    path: '',
    stream: undefined as never,
    ...overrides,
  };
}

function thrownResponse(run: () => void) {
  try {
    run();
  } catch (error) {
    return (error as ApiHttpException).getResponse();
  }
  throw new Error('expected ApiHttpException');
}

describe('image-file', () => {
  it('maps mime types to extensions', () => {
    expect(extensionForImageMime('image/jpeg')).toBe('.jpg');
    expect(extensionForImageMime('image/png')).toBe('.png');
    expect(extensionForImageMime('image/webp')).toBe('.webp');
  });

  it('rejects a missing file', () => {
    expect(
      thrownResponse(() => assertImageFile(undefined, errors)),
    ).toMatchObject({ code: API_ERROR_CODES.AVATAR_REQUIRED });
  });

  it('rejects an oversized file', () => {
    expect(
      thrownResponse(() =>
        assertImageFile(file({ size: AVATAR_MAX_BYTES + 1 }), errors),
      ),
    ).toMatchObject({ code: API_ERROR_CODES.AVATAR_TOO_LARGE });
  });

  it('rejects a non-image mime type', () => {
    expect(
      thrownResponse(() =>
        assertImageFile(file({ mimetype: 'application/pdf' }), errors),
      ),
    ).toMatchObject({ code: API_ERROR_CODES.AVATAR_INVALID_TYPE });
  });

  it('returns a valid image file', () => {
    const image = file();
    expect(assertImageFile(image, errors)).toBe(image);
  });
});
