import { API_ERROR_CODES } from '@nechto/api-contract';
import { assertAvatarFile, extensionForAvatarMime } from './avatar-file';
import { ApiHttpException } from '../common/errors/api-http-exception';

describe('avatar-file', () => {
  it('rejects missing files with AVATAR_REQUIRED', () => {
    try {
      assertAvatarFile(undefined);
      throw new Error('expected ApiHttpException');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiHttpException);
      expect((error as ApiHttpException).getResponse()).toMatchObject({
        code: API_ERROR_CODES.AVATAR_REQUIRED,
      });
    }
  });

  it('maps mime types to extensions', () => {
    expect(extensionForAvatarMime('image/jpeg')).toBe('.jpg');
    expect(extensionForAvatarMime('image/png')).toBe('.png');
    expect(extensionForAvatarMime('image/webp')).toBe('.webp');
  });
});
