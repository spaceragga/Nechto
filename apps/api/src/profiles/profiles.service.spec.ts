import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('ProfilesService', () => {
  let service: ProfilesService;
  const prisma = {
    profile: {
      findUnique: jest.fn(),
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
    await expect(service.uploadAvatar('u1', undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
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
