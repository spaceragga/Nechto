import { extensionForAvatarMime, normalizeAvatarFile } from './avatar-file';

describe('avatar-file', () => {
  it('rejects missing files', async () => {
    await expect(normalizeAvatarFile(undefined)).rejects.toMatchObject({
      status: 400,
    });
  });

  it('maps mime types to extensions', () => {
    expect(extensionForAvatarMime('image/jpeg')).toBe('.jpg');
    expect(extensionForAvatarMime('image/png')).toBe('.png');
    expect(extensionForAvatarMime('image/webp')).toBe('.webp');
  });

  it('rejects spoofed image content', async () => {
    await expect(
      normalizeAvatarFile({
        mimetype: 'image/png',
        size: 13,
        buffer: Buffer.from('<h1>no</h1>'),
      } as Express.Multer.File),
    ).rejects.toMatchObject({
      status: 415,
    });
  });
});
