import { Test, TestingModule } from '@nestjs/testing';
import { API_ERROR_CODES } from '@nechto/api-contract';
import { WorksService } from './works.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ApiHttpException } from '../common/errors/api-http-exception';

describe('WorksService', () => {
  let service: WorksService;
  const prisma = {
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    work: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };
  const storage = {
    put: jest.fn(),
    delete: jest.fn(),
    getPublicUrl: jest.fn(
      (key: string) => `http://localhost:3001/uploads/${key}`,
    ),
  };

  const profile = {
    id: 'p1',
    userId: 'u1',
    publishedAt: null,
  };

  const png = {
    fieldname: 'file',
    originalname: 'work.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 4,
    buffer: Buffer.from([1, 2, 3, 4]),
    destination: '',
    filename: '',
    path: '',
    stream: undefined as never,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.profile.findUnique.mockResolvedValue(profile);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        WorksService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = moduleRef.get(WorksService);
  });

  it('stores a work image and returns a public URL', async () => {
    storage.put.mockResolvedValue({
      key: 'works/p1/a.png',
      contentType: 'image/png',
      size: 4,
    });
    prisma.work.create.mockResolvedValue({
      id: 'w1',
      title: 'Yard',
      imageKey: 'works/p1/a.png',
      createdAt: new Date('2026-08-31T00:00:00.000Z'),
    });

    const view = await service.createMine('u1', png, { title: 'Yard' });

    expect(storage.put).toHaveBeenCalled();
    expect(view).toMatchObject({
      id: 'w1',
      title: 'Yard',
      imageUrl: 'http://localhost:3001/uploads/works/p1/a.png',
    });
  });

  it('rejects a missing work file', async () => {
    await expect(
      service.createMine('u1', undefined, { title: 'Yard' }),
    ).rejects.toBeInstanceOf(ApiHttpException);

    try {
      await service.createMine('u1', undefined, { title: 'Yard' });
    } catch (error) {
      expect((error as ApiHttpException).getResponse()).toMatchObject({
        code: API_ERROR_CODES.WORK_FILE_REQUIRED,
      });
    }
  });

  it('deletes a work and unpublishes when fewer than five remain', async () => {
    prisma.work.findFirst.mockResolvedValue({
      id: 'w1',
      profileId: 'p1',
      imageKey: 'works/p1/a.png',
    });
    prisma.profile.findUnique.mockResolvedValue({
      ...profile,
      publishedAt: new Date(),
    });
    prisma.work.count.mockResolvedValue(4);

    await service.deleteMine('u1', 'w1');

    expect(prisma.work.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
    expect(storage.delete).toHaveBeenCalledWith('works/p1/a.png');
    expect(prisma.profile.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { publishedAt: null },
    });
  });
});
