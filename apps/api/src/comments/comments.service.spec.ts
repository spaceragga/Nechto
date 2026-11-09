import { API_ERROR_CODES, type AuthUser } from '@nechto/api-contract';
import { CommentsService } from './comments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('CommentsService', () => {
  const prisma = {
    work: { findFirst: jest.fn() },
    project: { findFirst: jest.fn() },
    article: { findFirst: jest.fn() },
    dialogue: { findFirst: jest.fn() },
    comment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };
  const storage = {
    getPublicUrl: jest.fn(
      (key: string) => `http://localhost:3001/uploads/${key}`,
    ),
  };
  const notifications = { notify: jest.fn() };
  let service: CommentsService;

  const visitor: AuthUser = {
    id: 'u2',
    email: 'visitor@nechto.test',
    isCurator: false,
    isModerator: false,
    isAdmin: false,
  };
  const owner: AuthUser = {
    id: 'u1',
    email: 'author@nechto.test',
    isCurator: false,
    isModerator: false,
    isAdmin: false,
  };
  const moderator: AuthUser = {
    id: 'u3',
    email: 'mod@nechto.test',
    isCurator: false,
    isModerator: true,
    isAdmin: false,
  };

  const commentRow = {
    id: 'c1',
    body: 'Сильный кадр.',
    createdAt: new Date('2026-11-09T12:00:00.000Z'),
    authorId: 'u2',
    workId: 'w1',
    projectId: null,
    articleId: null,
    dialogueId: null,
    author: {
      id: 'u2',
      profile: {
        slug: 'anna-rusetskaya',
        displayName: 'Анна Русецкая',
        avatarKey: null,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.work.findFirst.mockResolvedValue({
      id: 'w1',
      profile: { userId: 'u1' },
    });
    service = new CommentsService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
      notifications as unknown as NotificationsService,
    );
  });

  it('lists comments on a published work', async () => {
    prisma.comment.findMany.mockResolvedValue([commentRow]);

    await expect(
      service.list({ targetType: 'work', targetId: 'w1', limit: 20 }, visitor),
    ).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: 'c1',
          body: 'Сильный кадр.',
          canDelete: true,
          author: expect.objectContaining({
            userId: 'u2',
            slug: 'anna-rusetskaya',
          }),
        }),
      ],
      nextCursor: null,
    });
  });

  it('creates a comment and notifies the owner', async () => {
    prisma.comment.create.mockResolvedValue(commentRow);
    notifications.notify.mockResolvedValue(undefined);

    await expect(
      service.create(
        { targetType: 'work', targetId: 'w1', body: 'Сильный кадр.' },
        visitor,
      ),
    ).resolves.toMatchObject({ id: 'c1', canDelete: true });

    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        authorId: 'u2',
        body: 'Сильный кадр.',
        workId: 'w1',
        projectId: null,
        articleId: null,
        dialogueId: null,
      },
      include: expect.anything(),
    });
    expect(notifications.notify).toHaveBeenCalledWith({
      userId: 'u1',
      kind: 'work_commented',
      actorId: 'u2',
      workId: 'w1',
      projectId: null,
      articleId: null,
      dialogueId: null,
      commentId: 'c1',
    });
  });

  it('does not expose comments on a hidden work', async () => {
    prisma.work.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        { targetType: 'work', targetId: 'w1', body: 'hidden' },
        visitor,
      ),
    ).rejects.toMatchObject({
      response: { code: API_ERROR_CODES.WORK_NOT_FOUND },
    });
    expect(prisma.comment.create).not.toHaveBeenCalled();
  });

  it('lets the author, owner, and moderator delete a comment', async () => {
    prisma.comment.findUnique.mockResolvedValue({
      ...commentRow,
      work: { profile: { userId: 'u1' } },
      project: null,
      article: null,
      dialogue: null,
    });
    prisma.comment.delete.mockResolvedValue(commentRow);

    await expect(service.remove('c1', visitor)).resolves.toBeUndefined();
    await expect(service.remove('c1', owner)).resolves.toBeUndefined();
    await expect(service.remove('c1', moderator)).resolves.toBeUndefined();
    expect(prisma.comment.delete).toHaveBeenCalledTimes(3);
  });

  it('forbids a stranger from deleting a comment', async () => {
    prisma.comment.findUnique.mockResolvedValue({
      ...commentRow,
      work: { profile: { userId: 'u1' } },
      project: null,
      article: null,
      dialogue: null,
    });
    const stranger: AuthUser = {
      id: 'u9',
      email: 'other@nechto.test',
      isCurator: false,
      isModerator: false,
      isAdmin: false,
    };

    await expect(service.remove('c1', stranger)).rejects.toMatchObject({
      response: { code: API_ERROR_CODES.FORBIDDEN },
    });
    expect(prisma.comment.delete).not.toHaveBeenCalled();
  });

  it('creates a comment on a published article', async () => {
    prisma.article.findFirst.mockResolvedValue({
      id: 'a1',
      profile: { userId: 'u1' },
    });
    prisma.comment.create.mockResolvedValue({
      ...commentRow,
      id: 'c2',
      workId: null,
      articleId: 'a1',
    });
    notifications.notify.mockResolvedValue(undefined);

    await service.create(
      { targetType: 'article', targetId: 'a1', body: 'Сильный кадр.' },
      visitor,
    );

    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'article_commented',
        articleId: 'a1',
        workId: null,
      }),
    );
  });
});
