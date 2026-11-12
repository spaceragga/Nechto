import { API_ERROR_CODES, type AuthUser } from '@nechto/api-contract';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { FollowService } from './follow.service';

describe('FollowService', () => {
  const prisma = {
    profile: { findFirst: jest.fn() },
    follow: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
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
      { getPublicUrl: (key: string) => key } as StorageService,
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

  it('lists followed profiles and marks the slugs on the page', async () => {
    prisma.follow.findMany
      .mockResolvedValueOnce([
        {
          id: 'f1',
          profile: {
            id: 'p1',
            userId: 'u1',
            displayName: 'Kasya',
            bio: null,
            avatarKey: 'avatars/a.webp',
            slug: 'kasia-voit',
            directions: ['photography'],
            websiteUrl: null,
            instagramUrl: null,
            telegramUrl: null,
            user: { email: 'a@nechto.test', suspendedAt: null },
            _count: { works: 2 },
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
            acceptPolicies: true,
            publishedAt: new Date('2026-01-02'),
            hidden: false,
            studioTitle: null,
            studioDescription: null,
            studioCoverKey: null,
            studioListedAt: null,
            studioFeaturedAt: null,
            studioHidden: false,
            homeFeaturedAt: null,
            homeSelectionAt: null,
          },
        },
      ])
      .mockResolvedValueOnce([{ profile: { slug: 'kasia-voit' } }]);

    const page = await service.listFollowing('u2', { limit: 20 });
    expect(page.nextCursor).toBeNull();
    expect(page.items).toEqual([
      expect.objectContaining({
        slug: 'kasia-voit',
        displayName: 'Kasya',
        avatarUrl: 'avatars/a.webp',
      }),
    ]);

    await expect(
      service.followedSlugs('u2', ['kasia-voit', 'kasia-voit']),
    ).resolves.toEqual({ slugs: ['kasia-voit'] });
    expect(prisma.follow.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          followerId: 'u2',
          profile: expect.objectContaining({
            slug: { in: ['kasia-voit'] },
          }),
        }),
      }),
    );
  });

  it('rejects following your own profile', async () => {
    prisma.profile.findFirst.mockResolvedValue({ id: 'p2', userId: 'u2' });
    await expect(service.follow('visitor', visitor)).rejects.toMatchObject({
      response: { code: API_ERROR_CODES.CANNOT_FOLLOW_SELF },
    });
    expect(prisma.follow.create).not.toHaveBeenCalled();
  });
});
