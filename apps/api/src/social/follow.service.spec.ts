import { API_ERROR_CODES, type AuthUser } from '@nechto/api-contract';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { FollowService } from './follow.service';

describe('FollowService', () => {
  const prisma = {
    profile: { findFirst: jest.fn() },
    follow: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  };
  const notifications = { notify: jest.fn() };
  const visitor: AuthUser = {
    id: 'u2',
    email: 'visitor@nechto.test',
    isCurator: false,
    isModerator: false,
    isAdmin: false,
  };
  let service: FollowService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.profile.findFirst.mockResolvedValue({ id: 'p1', userId: 'u1' });
    prisma.follow.count.mockResolvedValue(1);
    prisma.follow.findUnique.mockResolvedValue(null);
    service = new FollowService(
      prisma as unknown as PrismaService,
      notifications as unknown as NotificationsService,
    );
  });

  it('follows a published profile and notifies the owner', async () => {
    prisma.follow.create.mockResolvedValue({ id: 'f1' });
    prisma.follow.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'f1' });
    const snapshot = await service.follow('kasia-voit', visitor);
    expect(prisma.follow.create).toHaveBeenCalledWith({
      data: { followerId: 'u2', profileId: 'p1' },
    });
    expect(notifications.notify).toHaveBeenCalledWith({
      userId: 'u1',
      kind: 'profile_followed',
      actorId: 'u2',
      profileId: 'p1',
    });
    expect(snapshot).toEqual({ followerCount: 1, following: true });
  });

  it('rejects following your own profile', async () => {
    prisma.profile.findFirst.mockResolvedValue({ id: 'p2', userId: 'u2' });
    await expect(service.follow('visitor', visitor)).rejects.toMatchObject({
      response: { code: API_ERROR_CODES.CANNOT_FOLLOW_SELF },
    });
    expect(prisma.follow.create).not.toHaveBeenCalled();
  });
});
