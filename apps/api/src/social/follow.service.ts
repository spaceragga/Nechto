import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  type AuthUser,
  type FollowSnapshot,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { NotificationsService } from '../notifications/notifications.service';
import { publishedProfileWhere } from '../profiles/published-profile';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
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
