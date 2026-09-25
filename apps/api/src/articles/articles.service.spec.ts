import {
  ARTICLE_BODY_MIN_PUBLISH,
  API_ERROR_CODES,
  canPublishArticle,
} from '@nechto/api-contract';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ArticlesService } from './articles.service';

describe('ArticlesService', () => {
  const prisma = {
    profile: { findUnique: jest.fn() },
    work: { findFirst: jest.fn() },
    article: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const storage = {
    getPublicUrl: (key: string) => `http://localhost:3001/uploads/${key}`,
  };
  let service: ArticlesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ArticlesService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
    );
    prisma.profile.findUnique.mockResolvedValue({
      id: 'p1',
      publishedAt: new Date('2026-01-01'),
    });
  });

  it('creates a draft and rejects a cover from another profile', async () => {
    prisma.work.findFirst.mockResolvedValueOnce(null);
    await expect(
      service.createMine('u1', {
        title: 'Двор',
        lede: '',
        body: 'x'.repeat(ARTICLE_BODY_MIN_PUBLISH),
        coverWorkId: 'clcoverwork000000000000001',
      }),
    ).rejects.toMatchObject({
      response: { code: API_ERROR_CODES.WORK_NOT_FOUND },
    });

    prisma.work.findFirst.mockResolvedValueOnce({
      id: 'clcoverwork000000000000001',
    });
    prisma.article.create.mockResolvedValue({
      id: 'a1',
      title: 'Двор',
      lede: '',
      body: 'x'.repeat(ARTICLE_BODY_MIN_PUBLISH),
      coverWorkId: null,
      publishedAt: null,
      featuredAt: null,
      hidden: false,
      createdAt: new Date('2026-09-25'),
      coverWork: null,
    });

    await expect(
      service.createMine('u1', {
        title: 'Двор',
        lede: '',
        body: 'x'.repeat(ARTICLE_BODY_MIN_PUBLISH),
      }),
    ).resolves.toMatchObject({
      id: 'a1',
      title: 'Двор',
      publishedAt: null,
    });
  });

  it('publishes only when the profile is live and the body is long enough', async () => {
    expect(
      canPublishArticle({
        title: 'A',
        body: 'short',
        profilePublished: true,
      }),
    ).toBe(false);

    prisma.article.findFirst.mockResolvedValue({
      id: 'a1',
      profileId: 'p1',
      title: 'Двор',
      lede: '',
      body: 'x'.repeat(ARTICLE_BODY_MIN_PUBLISH),
      coverWorkId: null,
      publishedAt: null,
      featuredAt: null,
      hidden: false,
      createdAt: new Date('2026-09-25'),
      coverWork: null,
    });
    prisma.article.update.mockResolvedValue({
      id: 'a1',
      title: 'Двор',
      lede: '',
      body: 'x'.repeat(ARTICLE_BODY_MIN_PUBLISH),
      coverWorkId: null,
      publishedAt: new Date('2026-09-25'),
      featuredAt: null,
      hidden: false,
      createdAt: new Date('2026-09-25'),
      coverWork: null,
    });

    await expect(service.publishMine('u1', 'a1')).resolves.toMatchObject({
      publishedAt: '2026-09-25T00:00:00.000Z',
    });
  });
});
