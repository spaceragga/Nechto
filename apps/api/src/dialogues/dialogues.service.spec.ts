import { HttpStatus } from '@nestjs/common';
import { API_ERROR_CODES } from '@nechto/api-contract';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { DialoguesService } from './dialogues.service';

describe('DialoguesService', () => {
  const prisma = {
    dialogue: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    work: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };
  const storage = {
    getPublicUrl: (key: string) => `http://localhost:3001/uploads/${key}`,
  };
  let service: DialoguesService;

  const leftWork = {
    id: 'clworkleft000000000000001',
    profileId: 'p1',
    title: 'Left',
    description: '',
    imageKey: 'works/left.jpg',
    hidden: false,
    createdAt: new Date('2026-09-01'),
    profile: {
      id: 'p1',
      slug: 'kasia-voit',
      displayName: 'Кася',
      avatarKey: null,
      directions: ['photography'],
      publishedAt: new Date('2026-09-01'),
    },
  };
  const rightWork = {
    id: 'clworkright00000000000001',
    profileId: 'p2',
    title: 'Right',
    description: '',
    imageKey: 'works/right.jpg',
    hidden: false,
    createdAt: new Date('2026-09-01'),
    profile: {
      id: 'p2',
      slug: 'anna-rusetskaya',
      displayName: 'Анна',
      avatarKey: null,
      directions: ['interior'],
      publishedAt: new Date('2026-09-01'),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DialoguesService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
    );
  });

  it('rejects pairs from the same author', async () => {
    prisma.work.findFirst
      .mockResolvedValueOnce(leftWork)
      .mockResolvedValueOnce({ ...rightWork, profileId: 'p1' });

    await expect(
      service.create('u1', {
        title: 'Pair',
        note: '',
        leftWorkId: leftWork.id,
        rightWorkId: rightWork.id,
      }),
    ).rejects.toMatchObject({
      response: { code: API_ERROR_CODES.DIALOGUE_SAME_AUTHOR },
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('creates a draft from two published authors', async () => {
    prisma.work.findFirst
      .mockResolvedValueOnce(leftWork)
      .mockResolvedValueOnce(rightWork);
    prisma.dialogue.create.mockResolvedValue({
      id: 'd1',
      title: 'Свет и кухня',
      note: 'Две комнаты.',
      publishedAt: null,
      featuredAt: null,
      hidden: false,
      createdAt: new Date('2026-09-28'),
      leftWork,
      rightWork,
    });

    await expect(
      service.create('u1', {
        title: 'Свет и кухня',
        note: 'Две комнаты.',
        leftWorkId: leftWork.id,
        rightWorkId: rightWork.id,
      }),
    ).resolves.toMatchObject({
      id: 'd1',
      title: 'Свет и кухня',
      publishedAt: null,
      left: { title: 'Left', author: { slug: 'kasia-voit' } },
      right: { title: 'Right', author: { slug: 'anna-rusetskaya' } },
    });
  });
});
