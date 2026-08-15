import { S3StorageService } from './s3-storage.service';

describe('S3StorageService', () => {
  it('puts, deletes, and builds public URLs through the S3 client', async () => {
    const send = jest.fn().mockResolvedValue({});
    const storage = new S3StorageService();
    Object.defineProperty(storage, 'client', { value: { send } });
    Object.defineProperty(storage, 'bucket', { value: 'nechto' });

    await expect(
      storage.put({
        key: 'works/a.webp',
        body: Buffer.from('webp'),
        contentType: 'image/webp',
      }),
    ).resolves.toEqual({
      key: 'works/a.webp',
      contentType: 'image/webp',
      size: 4,
    });
    await expect(storage.delete('works/a.webp')).resolves.toBeUndefined();
    expect(send).toHaveBeenCalledTimes(2);
    expect(storage.getPublicUrl('works/a.webp')).toBe(
      'http://localhost:3001/uploads/works/a.webp',
    );
  });
});
