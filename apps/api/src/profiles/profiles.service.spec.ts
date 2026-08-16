import { Test, TestingModule } from '@nestjs/testing';
import { API_ERROR_CODES } from '@nechto/api-contract';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('ProfilesService', () => {
  let service: ProfilesService;
  const prisma = {
    profile: {
      findUnique: jest.fn(),
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
    prisma.profile.findUnique.mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      displayName: null,
      bio: null,
      avatarKey: null,
      user: { email: 'a@nechto.test' },
    });
    prisma.profile.update.mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      displayName: 'Artist',
      bio: 'Hello',
      avatarKey: null,
      user: { email: 'a@nechto.test' },
    });

    const view = await service.updateMine('u1', {
      displayName: 'Artist',
      bio: 'Hello',
    });

    expect(view.displayName).toBe('Artist');
    expect(view.bio).toBe('Hello');
    expect(view.avatarUrl).toBeNull();
  });

  it('rejects missing avatar file', async () => {
    await expect(service.uploadAvatar('u1', undefined)).rejects.toMatchObject({
      status: 400,
      response: { code: API_ERROR_CODES.AVATAR_REQUIRED },
    });
  });

  it('stores avatar and replaces previous key after DB update', async () => {
    prisma.profile.findUnique.mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      displayName: null,
      bio: null,
      avatarKey: 'avatars/u1/old.png',
      user: { email: 'a@nechto.test' },
    });
    storage.put.mockResolvedValue({
      key: 'avatars/u1/new.png',
      contentType: 'image/png',
      size: 4,
    });
    prisma.profile.update.mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      displayName: null,
      bio: null,
      avatarKey: 'avatars/u1/new.png',
      user: { email: 'a@nechto.test' },
    });

    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    const view = await service.uploadAvatar('u1', {
      fieldname: 'file',
      originalname: 'photo.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: png.byteLength,
      buffer: png,
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

  it('returns nextCursor when another catalog page exists', async () => {
    prisma.profile.findMany.mockResolvedValue(
      [0, 1, 2].map((index) => ({
        id: `c${index}`,
        userId: `u${index}`,
        slug: `artist-${index}`,
        displayName: `Artist ${index}`,
        bio: null,
        avatarKey: null,
        directions: ['photography'],
        websiteUrl: null,
        instagramUrl: null,
        telegramUrl: null,
        status: 'PUBLISHED',
        user: { email: `a${index}@nechto.test` },
      })),
    );

    const page = await service.listPublic(undefined, undefined, 2);

    expect(page.items).toHaveLength(2);
    expect(page.nextCursor).toBe('c1');
    expect(page.items[0]).not.toHaveProperty('email');
  });

  it('exports account data without the password hash', async () => {
    prisma.user.findUnique.mockResolvedValue({
      email: 'a@nechto.test',
      createdAt: new Date('2026-01-01'),
      profile: {
        slug: 'artist',
        displayName: 'Artist',
        works: [{ id: 'w1', title: 'Work', imageKey: 'works/w1.webp' }],
      },
    });

    await expect(service.exportMine('u1')).resolves.toEqual({
      email: 'a@nechto.test',
      createdAt: new Date('2026-01-01'),
      profile: {
        slug: 'artist',
        displayName: 'Artist',
        works: [{ id: 'w1', title: 'Work', imageKey: 'works/w1.webp' }],
      },
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'u1' },
      select: {
        email: true,
        createdAt: true,
        profile: {
          include: {
            works: { where: { status: { not: 'REMOVED' } } },
          },
        },
      },
    });
  });
});
