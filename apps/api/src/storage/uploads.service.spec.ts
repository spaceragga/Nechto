import {
  UploadsService,
  isSafeStorageKey,
  keyFromRouteParam,
} from './uploads.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';

describe('UploadsService', () => {
  const prisma = {
    profile: { findFirst: jest.fn() },
    work: { findFirst: jest.fn() },
  };
  const storage = {
    read: jest.fn(),
  };
  let service: UploadsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UploadsService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
    );
  });

  it('rejects unsafe keys without touching storage', async () => {
    await expect(
      service.readPublicObject('../secret.png', null),
    ).resolves.toBeNull();
    expect(prisma.profile.findFirst).not.toHaveBeenCalled();
    expect(storage.read).not.toHaveBeenCalled();
  });

  it('hides unpublished and suspended files from strangers', async () => {
    prisma.profile.findFirst.mockResolvedValue({
      publishedAt: new Date(),
      userId: 'owner',
      user: { suspendedAt: new Date() },
    });

    await expect(
      service.readPublicObject('avatars/owner/a.png', null),
    ).resolves.toBeNull();
    expect(storage.read).not.toHaveBeenCalled();

    prisma.profile.findFirst.mockResolvedValue({
      publishedAt: null,
      userId: 'owner',
      user: { suspendedAt: null },
    });
    await expect(
      service.readPublicObject('avatars/owner/a.png', null),
    ).resolves.toBeNull();
  });

  it('serves published files publicly and owner files while suspended', async () => {
    prisma.profile.findFirst.mockResolvedValue({
      publishedAt: new Date(),
      userId: 'owner',
      user: { suspendedAt: null },
    });
    storage.read.mockResolvedValue({
      body: Buffer.from('png'),
      contentType: 'image/png',
    });

    await expect(
      service.readPublicObject('avatars/owner/a.png', null),
    ).resolves.toEqual({
      body: Buffer.from('png'),
      contentType: 'image/png',
    });

    prisma.profile.findFirst.mockResolvedValue({
      publishedAt: new Date(),
      userId: 'owner',
      user: { suspendedAt: new Date() },
    });
    await expect(
      service.readPublicObject('avatars/owner/a.png', {
        id: 'owner',
        email: 'a@nechto.test',
      }),
    ).resolves.toEqual({
      body: Buffer.from('png'),
      contentType: 'image/png',
    });
  });

  it('looks up work images when the key is not an avatar', async () => {
    prisma.profile.findFirst.mockResolvedValue(null);
    prisma.work.findFirst.mockResolvedValue({
      profile: {
        publishedAt: new Date(),
        userId: 'owner',
        user: { suspendedAt: null },
      },
    });
    storage.read.mockResolvedValue({
      body: Buffer.from('work'),
      contentType: 'image/png',
    });

    await expect(
      service.readPublicObject('works/p1/a.png', null),
    ).resolves.toEqual({
      body: Buffer.from('work'),
      contentType: 'image/png',
    });
  });
});

describe('keyFromRouteParam', () => {
  it('joins Express 5 splat segments', () => {
    expect(keyFromRouteParam(['avatars', 'user-1', 'a.png'])).toBe(
      'avatars/user-1/a.png',
    );
    expect(keyFromRouteParam('avatars/user-1/a.png')).toBe(
      'avatars/user-1/a.png',
    );
  });
});

describe('isSafeStorageKey', () => {
  it('allows uuid object keys and rejects traversal', () => {
    expect(isSafeStorageKey('avatars/user-1/a.png')).toBe(true);
    expect(isSafeStorageKey('../etc/passwd')).toBe(false);
    expect(isSafeStorageKey('/avatars/a.png')).toBe(false);
    expect(isSafeStorageKey('')).toBe(false);
  });
});
