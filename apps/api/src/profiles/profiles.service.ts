import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  API_ERROR_CODES,
  CURRENT_POLICY_VERSION,
  type CreatorCatalogPage,
  type Profile,
  type PublicCreatorProfile,
  type UpdateProfileDto,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { isUniqueConstraintError } from '../prisma/is-unique-constraint-error';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { normalizeAvatarFile } from './avatar-file';
import { toProfileView, toPublicProfileView } from './profile.mapper';

export type ProfileView = Profile;

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async getMine(userId: string): Promise<ProfileView> {
    const profile = await this.ensureProfile(userId);
    return toProfileView(profile, this.storage);
  }

  async updateMine(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileView> {
    await this.ensureProfile(userId);

    const profile = await this.prisma.profile
      .update({
        where: { userId },
        data: {
          ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
          ...(dto.displayName !== undefined
            ? { displayName: dto.displayName }
            : {}),
          ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
          ...(dto.directions !== undefined
            ? { directions: dto.directions }
            : {}),
          ...(dto.websiteUrl !== undefined
            ? { websiteUrl: dto.websiteUrl }
            : {}),
          ...(dto.instagramUrl !== undefined
            ? { instagramUrl: dto.instagramUrl }
            : {}),
          ...(dto.telegramUrl !== undefined
            ? { telegramUrl: dto.telegramUrl }
            : {}),
          ...(dto.acceptPolicies
            ? {
                policyVersion: CURRENT_POLICY_VERSION,
                policyAcceptedAt: new Date(),
              }
            : {}),
        },
        include: { user: { select: { email: true } } },
      })
      .catch((error: unknown) => {
        if (isUniqueConstraintError(error)) {
          throw new ApiHttpException(
            HttpStatus.CONFLICT,
            API_ERROR_CODES.SLUG_TAKEN,
            'Profile slug is already taken',
          );
        }
        throw error;
      });

    return toProfileView(profile, this.storage);
  }

  async publishMine(userId: string): Promise<ProfileView> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, emailVerifiedAt: true } },
        _count: { select: { works: { where: { status: 'PUBLISHED' } } } },
      },
    });
    const hasContact = Boolean(
      profile?.websiteUrl || profile?.instagramUrl || profile?.telegramUrl,
    );
    if (
      !profile?.slug ||
      !profile.displayName ||
      !profile.avatarKey ||
      profile.directions.length === 0 ||
      !hasContact ||
      profile.policyVersion !== CURRENT_POLICY_VERSION ||
      !profile.user.emailVerifiedAt ||
      profile._count.works < 5
    ) {
      throw new ApiHttpException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        API_ERROR_CODES.PUBLISH_REQUIREMENTS_NOT_MET,
        'Complete the profile and publish at least five works',
      );
    }
    const updated = await this.prisma.profile.update({
      where: { id: profile.id },
      data: { status: 'PUBLISHED' },
      include: { user: { select: { email: true } } },
    });
    return toProfileView(updated, this.storage);
  }

  async getPublicBySlug(slug: string): Promise<PublicCreatorProfile> {
    const profile = await this.prisma.profile.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        user: { select: { email: true } },
        works: {
          where: { status: 'PUBLISHED' },
          orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
    await this.incrementMetric(profile.id, 'views');
    return {
      profile: toPublicProfileView(profile, this.storage),
      works: profile.works.map((work) => ({
        id: work.id,
        title: work.title,
        caption: work.caption,
        altText: work.altText,
        imageUrl: this.storage.getPublicUrl(work.imageKey),
        thumbnailUrl: this.storage.getPublicUrl(work.thumbnailKey),
        width: work.width,
        height: work.height,
        position: work.position,
        status: 'PUBLISHED' as const,
      })),
    };
  }

  async listPublic(
    direction: string | undefined,
    cursor: string | undefined,
    limit: number,
  ): Promise<CreatorCatalogPage> {
    const profiles = await this.prisma.profile.findMany({
      where: {
        status: 'PUBLISHED',
        ...(direction ? { directions: { has: direction } } : {}),
      },
      include: { user: { select: { email: true } } },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasMore = profiles.length > limit;
    const items = profiles.slice(0, limit);
    return {
      items: items.map((profile) => toPublicProfileView(profile, this.storage)),
      nextCursor: hasMore ? (items.at(-1)?.id ?? null) : null,
    };
  }

  async recordContact(slug: string): Promise<void> {
    const profile = await this.prisma.profile.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
    await this.incrementMetric(profile.id, 'contactClicks');
  }

  async exportMine(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        createdAt: true,
        profile: {
          include: {
            works: { where: { status: { not: 'REMOVED' } } },
          },
        },
      },
    });
    if (!user) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.USER_NOT_FOUND,
        'User not found',
      );
    }
    return user;
  }

  async deleteMine(userId: string): Promise<void> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        avatarKey: true,
        works: { select: { imageKey: true, thumbnailKey: true } },
      },
    });
    await this.prisma.user.delete({ where: { id: userId } });
    const keys = [
      ...(profile?.avatarKey ? [profile.avatarKey] : []),
      ...(profile?.works.flatMap((work) => [
        work.imageKey,
        work.thumbnailKey,
      ]) ?? []),
    ];
    const cleanup = await Promise.allSettled(
      keys.map((key) => this.storage.delete(key)),
    );
    if (cleanup.some((result) => result.status === 'rejected')) {
      this.logger.warn(`Failed to delete all media for removed user ${userId}`);
    }
  }

  private async incrementMetric(
    profileId: string,
    field: 'views' | 'contactClicks',
  ): Promise<void> {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    await this.prisma.profileDailyMetric.upsert({
      where: { profileId_date: { profileId, date } },
      create: {
        profileId,
        date,
        [field]: 1,
      },
      update: { [field]: { increment: 1 } },
    });
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<ProfileView> {
    const avatar = await normalizeAvatarFile(file);
    const profile = await this.ensureProfile(userId);
    const previousKey = profile.avatarKey;
    const key = `avatars/${userId}/${randomUUID()}${avatar.extension}`;

    await this.storage.put({
      key,
      body: avatar.body,
      contentType: avatar.contentType,
    });

    // Persist the new key before deleting the old object so a crash cannot leave
    // the DB pointing at a deleted file.
    const updated = await this.prisma.profile
      .update({
        where: { userId },
        data: { avatarKey: key },
        include: { user: { select: { email: true } } },
      })
      .catch(async (error: unknown) => {
        try {
          await this.storage.delete(key);
        } catch (cleanupError) {
          this.logger.error(
            `Failed to delete orphaned avatar key ${key}`,
            cleanupError instanceof Error ? cleanupError.stack : undefined,
          );
        }
        throw error;
      });

    if (previousKey && previousKey !== key) {
      try {
        await this.storage.delete(previousKey);
      } catch (error) {
        this.logger.warn(
          `Failed to delete previous avatar key ${previousKey}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return toProfileView(updated, this.storage);
  }

  private async ensureProfile(userId: string) {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } },
    });

    if (existing) {
      return existing;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.USER_NOT_FOUND,
        'User not found',
      );
    }

    try {
      return await this.prisma.profile.create({
        data: { userId },
        include: { user: { select: { email: true } } },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const raced = await this.prisma.profile.findUnique({
          where: { userId },
          include: { user: { select: { email: true } } },
        });
        if (raced) {
          return raced;
        }
      }
      throw error;
    }
  }
}
