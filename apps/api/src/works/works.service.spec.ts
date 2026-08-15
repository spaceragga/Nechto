import { WorksService } from './works.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('WorksService', () => {
  const prisma = {
    work: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  const storage = {
    getPublicUrl: jest.fn((key: string) => `https://media.test/${key}`),
    delete: jest.fn(),
  };
  const service = new WorksService(
    prisma as unknown as PrismaService,
    storage as unknown as StorageService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('lists only owned active works as public storage URLs', async () => {
    prisma.work.findMany.mockResolvedValue([
      {
        id: 'work-1',
        title: 'Poster',
        caption: null,
        altText: 'Blue poster',
        imageKey: 'works/p1/work-1.webp',
        thumbnailKey: 'works/p1/work-1-thumb.webp',
        width: 1200,
        height: 1600,
        position: 0,
        status: 'PUBLISHED',
      },
    ]);

    await expect(service.listMine('user-1')).resolves.toEqual([
      expect.objectContaining({
        id: 'work-1',
        imageUrl: 'https://media.test/works/p1/work-1.webp',
        status: 'PUBLISHED',
      }),
    ]);
    expect(prisma.work.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          profile: { userId: 'user-1' },
          status: { not: 'REMOVED' },
        },
      }),
    );
  });

  it('soft-deletes owned work before deleting media', async () => {
    prisma.work.findFirst.mockResolvedValue({
      id: 'work-1',
      imageKey: 'image',
      thumbnailKey: 'thumb',
    });
    prisma.work.update.mockResolvedValue({});
    storage.delete.mockResolvedValue(undefined);

    await service.remove('user-1', 'work-1');

    expect(prisma.work.update).toHaveBeenCalledWith({
      where: { id: 'work-1' },
      data: { status: 'REMOVED' },
    });
    expect(storage.delete).toHaveBeenCalledTimes(2);
  });
});
