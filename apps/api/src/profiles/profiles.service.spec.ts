import { Test, TestingModule } from '@nestjs/testing';
import { API_ERROR_CODES, canPublishProfile } from '@nechto/api-contract';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ApiHttpException } from '../common/errors/api-http-exception';

const baseProfile = {
  id: 'p1',
  userId: 'u1',
  displayName: null as string | null,
  bio: null as string | null,
  avatarKey: null as string | null,
  slug: null as string | null,
  directions: [] as string[],
  websiteUrl: null as string | null,
  instagramUrl: null as string | null,
  telegramUrl: null as string | null,
  acceptPolicies: false,
  publishedAt: null as Date | null,
  user: { email: 'a@nechto.test', suspendedAt: null as Date | null },
  _count: { works: 0 },
};

describe('ProfilesService', () => {
  let service: ProfilesService;
  const prisma = {
    profile: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };
  const storage = {
    put: jest.fn(),
    delete: jest.fn(),
    getPublicUrl: jest.fn(
      (key: string) => `http://localhost:3001/uploads/${key}`,
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = moduleRef.get(ProfilesService);
  });

  it('updates display name and bio', async () => {
    prisma.profile.findUnique.mockResolvedValue(baseProfile);
    prisma.profile.update.mockResolvedValue({
      ...baseProfile,
      displayName: 'Artist',
      bio: 'Hello',
    });

    const view = await service.updateMine('u1', {
      displayName: 'Artist',
      bio: 'Hello',
    });

    expect(view.displayName).toBe('Artist');
    expect(view.bio).toBe('Hello');
    expect(view.avatarUrl).toBeNull();
    expect(view.slug).toBeNull();
  });

  it('rejects publish when the profile is incomplete', async () => {
    prisma.profile.findUnique.mockResolvedValue(baseProfile);

    await expect(service.publishMine('u1')).rejects.toBeInstanceOf(
      ApiHttpException,
    );

    try {
      await service.publishMine('u1');
    } catch (error) {
      expect((error as ApiHttpException).getResponse()).toMatchObject({
        code: API_ERROR_CODES.PUBLISH_REQUIREMENTS_NOT_MET,
      });
    }
  });

  it('publishes when name, slug, policies, and five works are set', async () => {
    const ready = {
      ...baseProfile,
      displayName: 'Artist',
      slug: 'artist',
      acceptPolicies: true,
      _count: { works: 5 },
    };
    prisma.profile.findUnique.mockResolvedValue(ready);
    prisma.profile.update.mockResolvedValue({
      ...ready,
      publishedAt: new Date('2026-08-31T00:00:00.000Z'),
    });

    const view = await service.publishMine('u1');

    expect(view.publishedAt).toBe('2026-08-31T00:00:00.000Z');
    expect(view.workCount).toBe(5);
  });

  it('canPublishProfile requires name, slug, policies, and five works', () => {
    const ready = {
      displayName: 'Artist',
      slug: 'artist',
      acceptPolicies: true,
      workCount: 5,
    };

    expect(canPublishProfile(ready)).toBe(true);
    expect(canPublishProfile({ ...ready, displayName: '  ' })).toBe(false);
    expect(canPublishProfile({ ...ready, workCount: 4 })).toBe(false);
    expect(canPublishProfile({ ...ready, acceptPolicies: false })).toBe(false);
  });

  it('rejects missing avatar file', async () => {
    await expect(service.uploadAvatar('u1', undefined)).rejects.toBeInstanceOf(
      ApiHttpException,
    );
  });

  it('stores avatar and replaces previous key after DB update', async () => {
    prisma.profile.findUnique.mockResolvedValue({
      ...baseProfile,
      avatarKey: 'avatars/u1/old.png',
    });
    storage.put.mockResolvedValue({
      key: 'avatars/u1/new.png',
      contentType: 'image/png',
      size: 4,
    });
    prisma.profile.update.mockResolvedValue({
      ...baseProfile,
      avatarKey: 'avatars/u1/new.png',
    });

    const view = await service.uploadAvatar('u1', {
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
    });

    expect(storage.put).toHaveBeenCalled();
    expect(prisma.profile.update).toHaveBeenCalled();
    expect(storage.delete).toHaveBeenCalledWith('avatars/u1/old.png');
    const putOrder = storage.put.mock.invocationCallOrder[0]!;
    const updateOrder = prisma.profile.update.mock.invocationCallOrder[0]!;
    const deleteOrder = storage.delete.mock.invocationCallOrder[0]!;
    expect(putOrder).toBeLessThan(updateOrder);
    expect(updateOrder).toBeLessThan(deleteOrder);
    expect(view.avatarUrl).toBe(
      'http://localhost:3001/uploads/avatars/u1/new.png',
    );
  });
});
