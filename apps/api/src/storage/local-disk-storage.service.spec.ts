import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalDiskStorageService } from './local-disk-storage.service';

describe('LocalDiskStorageService', () => {
  const originalRoot = process.env.STORAGE_LOCAL_ROOT;
  const originalPublic = process.env.STORAGE_PUBLIC_BASE_URL;
  let rootDir: string;
  let storage: LocalDiskStorageService;

  beforeEach(() => {
    rootDir = mkdtempSync(join(tmpdir(), 'nechto-storage-'));
    process.env.STORAGE_LOCAL_ROOT = rootDir;
    process.env.STORAGE_PUBLIC_BASE_URL = 'http://localhost:3001/uploads';

    jest.resetModules();
    // Re-require env-backed service class after env mutation is awkward;
    // construct against already-loaded class then override via reflection.
    storage = new LocalDiskStorageService();
    Object.defineProperty(storage, 'rootDir', { value: rootDir });
  });

  afterEach(() => {
    rmSync(rootDir, { recursive: true, force: true });
    if (originalRoot === undefined) {
      delete process.env.STORAGE_LOCAL_ROOT;
    } else {
      process.env.STORAGE_LOCAL_ROOT = originalRoot;
    }
    if (originalPublic === undefined) {
      delete process.env.STORAGE_PUBLIC_BASE_URL;
    } else {
      process.env.STORAGE_PUBLIC_BASE_URL = originalPublic;
    }
  });

  it('writes, resolves public URL, and deletes objects', async () => {
    const stored = await storage.put({
      key: 'avatars/user-1/photo.png',
      body: Buffer.from('png-bytes'),
      contentType: 'image/png',
    });

    expect(stored.size).toBe(9);
    expect(
      readFileSync(join(rootDir, 'avatars/user-1/photo.png'), 'utf8'),
    ).toBe('png-bytes');
    expect(storage.getPublicUrl(stored.key)).toBe(
      'http://localhost:3001/uploads/avatars/user-1/photo.png',
    );

    await storage.delete(stored.key);
    await expect(storage.delete(stored.key)).resolves.toBeUndefined();
  });
});
