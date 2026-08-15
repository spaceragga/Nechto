import { BadRequestException } from '@nestjs/common';
import { assertAvatarFile, extensionForAvatarMime } from './avatar-file';

describe('avatar-file', () => {
  it('rejects missing files', () => {
    expect(() => assertAvatarFile(undefined)).toThrow(BadRequestException);
  });

  it('maps mime types to extensions', () => {
    expect(extensionForAvatarMime('image/jpeg')).toBe('.jpg');
    expect(extensionForAvatarMime('image/png')).toBe('.png');
    expect(extensionForAvatarMime('image/webp')).toBe('.webp');
  });
});
