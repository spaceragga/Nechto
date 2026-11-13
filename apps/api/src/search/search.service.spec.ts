import type { SearchQuery } from '@nechto/api-contract';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SearchService } from './search.service';

describe('SearchService', () => {
  const prisma = {
    work: { findMany: jest.fn() },
    profile: { findMany: jest.fn() },
    project: { findMany: jest.fn() },
    article: { findMany: jest.fn() },
    dialogue: { findMany: jest.fn() },
  };
  const storage = {
    publicUrl: jest.fn((key: string) => `/uploads/${key}`),
  };
  let service: SearchService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.work.findMany.mockResolvedValue([]);
    prisma.profile.findMany.mockResolvedValue([]);
    prisma.project.findMany.mockResolvedValue([]);
    prisma.article.findMany.mockResolvedValue([]);
    prisma.dialogue.findMany.mockResolvedValue([]);
    service = new SearchService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
    );
  });

  it('returns nothing for a query shorter than two characters', async () => {
    const result = await service.search({ q: ' я ', limit: 8 });

    expect(result).toEqual({
      q: 'я',
      works: [],
      creators: [],
      projects: [],
      articles: [],
      dialogues: [],
      studios: [],
    });
    expect(prisma.work.findMany).not.toHaveBeenCalled();
  });

  it('matches captions and body text, not only titles', async () => {
    const query: SearchQuery = { q: 'софт', limit: 8 };
    await service.search(query);
    const text = { contains: 'софт', mode: 'insensitive' };

    expect(prisma.work.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ title: text }, { description: text }],
        }),
      }),
    );
    expect(prisma.profile.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: [{ displayName: text }, { slug: text }, { bio: text }],
            }),
          ]),
        }),
      }),
    );
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: text },
            { description: text },
            { blocks: { some: { body: text } } },
          ],
        }),
      }),
    );
    expect(prisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ title: text }, { lede: text }, { body: text }],
        }),
      }),
    );
    expect(prisma.dialogue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ title: text }, { note: text }],
        }),
      }),
    );
    expect(prisma.profile.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: [
                { studioTitle: text },
                { studioDescription: text },
                { displayName: text },
              ],
            }),
          ]),
        }),
      }),
    );
  });
});
