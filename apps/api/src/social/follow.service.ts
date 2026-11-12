import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  type AuthUser,
  type CursorPage,
  type CursorPageQuery,
  type FollowMarks,
  type FollowSnapshot,
  type PublicProfile,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { NotificationsService } from '../notifications/notifications.service';
import {
  profileInclude,
  toProfileRecord,
  toPublicProfile,
} from '../profiles/profile.mapper';
import { publishedProfileWhere } from '../profiles/published-profile';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class FollowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly storage: StorageService,
  ) {}

  async status(slug: string, userId: string | null): Promise<FollowSnapshot> {
    const profile = await this.requirePublished(slug);
    return this.snapshot(profile.id, userId);
  }

  async follow(slug: string, user: AuthUser): Promise<FollowSnapshot> {
    const profile = await this.requirePublished(slug);
    if (profile.userId === user.id) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.CANNOT_FOLLOW_SELF,
        'Cannot follow your own profile',
      );
    }
    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_profileId: {
          followerId: user.id,
          profileId: profile.id,
        },
      },
      select: { id: true },
    });
    if (!existing) {
      await this.prisma.follow.create({
        data: { followerId: user.id, profileId: profile.id },
      });
      await this.notifications.notify({
        userId: profile.userId,
        kind: 'profile_followed',
        actorId: user.id,
        profileId: profile.id,
      });
    }
    return this.snapshot(profile.id, user.id);
  }

  async listFollowing(
    userId: string,
    query: CursorPageQuery,
  ): Promise<CursorPage<PublicProfile>> {
    const rows = await this.prisma.follow.findMany({
      where: {
        followerId: userId,
        profile: publishedProfileWhere,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: {
        profile: { include: profileInclude },
      },
    });
    const hasMore = rows.length > query.limit;
    const slice = hasMore ? rows.slice(0, query.limit) : rows;
    return {
      items: slice.map((row) =>
        toPublicProfile(toProfileRecord(row.profile), this.storage),
      ),
      nextCursor: hasMore ? (slice[slice.length - 1]?.id ?? null) : null,
    };
  }

  async followedSlugs(userId: string, slugs: string[]): Promise<FollowMarks> {
    const unique = [...new Set(slugs)];
    if (unique.length === 0) {
      return { slugs: [] };
    }
    const rows = await this.prisma.follow.findMany({
      where: {
        followerId: userId,
        profile: { ...publishedProfileWhere, slug: { in: unique } },
      },
      select: { profile: { select: { slug: true } } },
    });
    return {
      slugs: rows.flatMap((row) =>
        row.profile.slug ? [row.profile.slug] : [],
      ),
    };
  }

  async unfollow(slug: string, user: AuthUser): Promise<FollowSnapshot> {
    const profile = await this.requirePublished(slug);
    await this.prisma.follow.deleteMany({
      where: { followerId: user.id, profileId: profile.id },
    });
    return this.snapshot(profile.id, user.id);
  }

  private async snapshot(
    profileId: string,
    userId: string | null,
  ): Promise<FollowSnapshot> {
    const [followerCount, following] = await Promise.all([
      this.prisma.follow.count({ where: { profileId } }),
      userId
        ? this.prisma.follow.findUnique({
            where: {
              followerId_profileId: { followerId: userId, profileId },
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);
    return {
      followerCount,
      following: Boolean(following),
    };
  }

  private async requirePublished(slug: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { ...publishedProfileWhere, slug },
      select: { id: true, userId: true },
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
    return profile;
  }
}
