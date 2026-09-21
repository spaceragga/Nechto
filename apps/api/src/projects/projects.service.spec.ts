import { Test, TestingModule } from '@nestjs/testing';
import { API_ERROR_CODES } from '@nechto/api-contract';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ApiHttpException } from '../common/errors/api-http-exception';

describe('ProjectsService', () => {
  let service: ProjectsService;
  const prisma = {
    profile: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    work: {
      findMany: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    projectBlock: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const storage = {
    getPublicUrl: jest.fn(
      (key: string) => `http://localhost:3001/uploads/${key}`,
    ),
  };

  const profile = { id: 'p1', userId: 'u1' };
  const workRow = {
    id: 'w1',
    title: 'Yard',
    description: 'Wet asphalt.',
    imageKey: 'works/p1/a.png',
    createdAt: new Date('2026-08-31T00:00:00.000Z'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.profile.findUnique.mockResolvedValue(profile);
    prisma.work.findMany.mockResolvedValue([{ id: 'w1' }]);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = moduleRef.get(ProjectsService);
  });

  it('creates a project with an image and text between frames', async () => {
    prisma.work.findMany.mockResolvedValue([{ id: 'w1' }, { id: 'w2' }]);
    prisma.project.create.mockResolvedValue({
      id: 'pr1',
      title: 'Yards',
      description: 'A series.',
      createdAt: new Date('2026-08-31T00:00:00.000Z'),
      blocks: [
        { kind: 'image', body: '', showTitle: true, work: workRow },
        { kind: 'text', body: 'After rain.', showTitle: true, work: null },
        {
          kind: 'image',
          body: '',
          showTitle: false,
          work: { ...workRow, id: 'w2', title: 'Lane' },
        },
      ],
    });

    const view = await service.createMine('u1', {
      title: 'Yards',
      description: 'A series.',
      blocks: [
        { kind: 'image', workId: 'w1', showTitle: true },
        { kind: 'text', body: 'After rain.' },
        { kind: 'image', workId: 'w2', showTitle: false },
      ],
    });

    expect(view.blocks).toEqual([
      {
        kind: 'image',
        showTitle: true,
        work: expect.objectContaining({ id: 'w1', title: 'Yard' }),
      },
      { kind: 'text', body: 'After rain.' },
      {
        kind: 'image',
        showTitle: false,
        work: expect.objectContaining({ id: 'w2', title: 'Lane' }),
      },
    ]);
  });

  it('rejects a duplicate work in the same project', async () => {
    await expect(
      service.createMine('u1', {
        title: 'Yards',
        description: '',
        blocks: [
          { kind: 'image', workId: 'w1', showTitle: true },
          { kind: 'image', workId: 'w1', showTitle: true },
        ],
      }),
    ).rejects.toBeInstanceOf(ApiHttpException);
  });

  it('rejects a work that belongs to someone else', async () => {
    prisma.work.findMany.mockResolvedValue([]);

    try {
      await service.createMine('u1', {
        title: 'Yards',
        description: '',
        blocks: [{ kind: 'image', workId: 'w9', showTitle: true }],
      });
    } catch (error) {
      expect((error as ApiHttpException).getResponse()).toMatchObject({
        code: API_ERROR_CODES.WORK_NOT_FOUND,
      });
    }
  });

  it('lists published series for the house', async () => {
    prisma.project.findMany.mockResolvedValue([
      {
        id: 'pr1',
        title: 'Yards',
        description: 'A series.',
        createdAt: new Date('2026-08-31T00:00:00.000Z'),
        blocks: [{ kind: 'image', body: '', showTitle: true, work: workRow }],
        profile: {
          slug: 'kasia-voit',
          displayName: 'Кася Войт',
          avatarKey: null,
          directions: ['photography'],
        },
      },
    ]);

    const page = await service.listPublished({ limit: 20 });

    expect(page.items).toEqual([
      expect.objectContaining({
        id: 'pr1',
        title: 'Yards',
        coverImageUrl: 'http://localhost:3001/uploads/works/p1/a.png',
        frameImageUrls: ['http://localhost:3001/uploads/works/p1/a.png'],
        author: expect.objectContaining({ slug: 'kasia-voit' }),
      }),
    ]);
  });

  it('filters the published catalog by creator direction', async () => {
    prisma.project.findMany.mockResolvedValue([]);

    await service.listPublished({ limit: 20, direction: 'photography' });

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          profile: expect.objectContaining({
            directions: { has: 'photography' },
          }),
        }),
      }),
    );
  });

  it('hides a project when the profile is unpublished', async () => {
    prisma.project.findFirst.mockResolvedValue(null);

    try {
      await service.getPublishedById('pr1');
    } catch (error) {
      expect((error as ApiHttpException).getResponse()).toMatchObject({
        code: API_ERROR_CODES.PROJECT_NOT_FOUND,
      });
    }
  });
});
