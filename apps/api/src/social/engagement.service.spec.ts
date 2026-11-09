import { API_ERROR_CODES, type AuthUser } from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ContentEngagementService } from './content-engagement.service';
import { EngagementService } from './engagement.service';
import { PublicTargetService } from './resolve-public-target';

describe('EngagementService', () => {
  const prisma = {
    contentLike: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    contentView: { count: jest.fn() },
  };
  const targets = { require: jest.fn() };
  const notifications = { notify: jest.fn() };
  const visitor: AuthUser = {
    id: 'u2',
    email: 'visitor@nechto.test',
    isCurator: false,
    isModerator: false,
    isAdmin: false,
  };
  const target = {
    targetType: 'work' as const,
    targetId: 'w1',
    ownerUserIds: ['u1'],
    workId: 'w1',
    projectId: null,
    articleId: null,
    dialogueId: null,
  };
  let service: EngagementService;

  beforeEach(() => {
    jest.clearAllMocks();
    targets.require.mockResolvedValue(target);
    prisma.contentLike.count.mockResolvedValue(1);
    prisma.contentView.count.mockResolvedValue(3);
    prisma.contentLike.findUnique.mockResolvedValue(null);
    const content = new ContentEngagementService(
      prisma as unknown as PrismaService,
      targets as unknown as PublicTargetService,
    );
    service = new EngagementService(
      prisma as unknown as PrismaService,
      targets as unknown as PublicTargetService,
      content,
      notifications as unknown as NotificationsService,
    );
  });

  it('creates a like and notifies the owner once', async () => {
    prisma.contentLike.create.mockResolvedValue({ id: 'l1' });
    prisma.contentLike.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'l1' });
    const snapshot = await service.like(
      { targetType: 'work', targetId: 'w1' },
      visitor,
    );
    expect(prisma.contentLike.create).toHaveBeenCalled();
    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        kind: 'work_liked',
        actorId: 'u2',
        workId: 'w1',
      }),
    );
    expect(snapshot).toEqual({
      likeCount: 1,
      viewCount: 3,
      likedByMe: true,
    });
  });

  it('does not notify again on a second like', async () => {
    prisma.contentLike.findUnique.mockResolvedValue({ id: 'l1' });
    await service.like({ targetType: 'work', targetId: 'w1' }, visitor);
    expect(prisma.contentLike.create).not.toHaveBeenCalled();
    expect(notifications.notify).not.toHaveBeenCalled();
  });

  it('unlikes without error when the like is missing', async () => {
    prisma.contentLike.deleteMany.mockResolvedValue({ count: 0 });
    prisma.contentLike.findUnique.mockResolvedValue(null);
    await expect(
      service.unlike({ targetType: 'work', targetId: 'w1' }, visitor),
    ).resolves.toEqual({
      likeCount: 1,
      viewCount: 3,
      likedByMe: false,
    });
  });

  it('surfaces missing works', async () => {
    targets.require.mockRejectedValue(
      new ApiHttpException(
        404,
        API_ERROR_CODES.WORK_NOT_FOUND,
        'Work not found',
      ),
    );
    await expect(
      service.like({ targetType: 'work', targetId: 'missing' }, visitor),
    ).rejects.toMatchObject({
      response: { code: API_ERROR_CODES.WORK_NOT_FOUND },
    });
  });
});
