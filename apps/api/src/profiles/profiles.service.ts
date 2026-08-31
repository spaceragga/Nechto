import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  API_ERROR_CODES,
  canPublishProfile,
  type CreatorDirection,
  type CursorPage,
  type ListCreatorsQuery,
  type Profile,
  type PublicProfile,
  type PublicProfileWithWorks,
  type UpdateProfileDto,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import {
  isUniqueConstraintError,
  isUniqueConstraintOn,
} from '../prisma/is-unique-constraint-error';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { toWorkView } from '../works/work.mapper';
import { assertAvatarFile, extensionForAvatarMime } from './avatar-file';
import {
  profileInclude,
  toProfileRecord,
  toProfileView,
  toPublicProfile,
  type ProfileRecord,
  type ProfileWrite,
} from './profile.mapper';
import { publishedProfileWhere } from './published-profile';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async getMine(userId: string): Promise<Profile> {
    const profile = await this.ensureProfile(userId);
    return toProfileView(profile, this.storage);
  }

  async getByUserId(userId: string): Promise<PublicProfile> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: profileInclude,
    });

    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }

    return toPublicProfile(toProfileRecord(profile), this.storage);
  }

  async getPublishedBySlug(slug: string): Promise<PublicProfile> {
    const profile = await this.prisma.profile.findFirst({
      where: { ...publishedProfileWhere, slug },
      include: profileInclude,
    });

    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }

    return toPublicProfile(toProfileRecord(profile), this.storage);
  }

  async listPublished(
    query: ListCreatorsQuery,
  ): Promise<CursorPage<PublicProfileWithWorks>> {
    const rows = await this.prisma.profile.findMany({
      where: {
        ...publishedProfileWhere,
        ...(query.direction ? { directions: { has: query.direction } } : {}),
      },
      orderBy: { id: 'desc' },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: {
        ...profileInclude,
        works: {
          orderBy: { id: 'desc' },
          take: 4,
        },
      },
    });

    const hasMore = rows.length > query.limit;
    const slice = hasMore ? rows.slice(0, query.limit) : rows;

    return {
      items: slice.map((row) => ({
        ...toPublicProfile(toProfileRecord(row), this.storage),
        latestWorks: row.works.map((work) => toWorkView(work, this.storage)),
      })),
      nextCursor: hasMore ? (slice[slice.length - 1]?.id ?? null) : null,
    };
  }

  async updateMine(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    await this.ensureProfile(userId);

    try {
      const profile = await this.updateByUserId(userId, this.toUpdateData(dto));

      return toProfileView(profile, this.storage);
    } catch (error) {
      if (isUniqueConstraintOn(error, 'slug')) {
        throw new ApiHttpException(
          HttpStatus.CONFLICT,
          API_ERROR_CODES.SLUG_TAKEN,
          'This profile address is already taken',
        );
      }
      throw error;
    }
  }

  async publishMine(userId: string): Promise<Profile> {
    const profile = await this.ensureProfile(userId);

    if (
      !canPublishProfile({
        displayName: profile.displayName,
        slug: profile.slug,
        acceptPolicies: profile.acceptPolicies,
        workCount: profile._count?.works ?? 0,
      })
    ) {
      throw new ApiHttpException(
        HttpStatus.FORBIDDEN,
        API_ERROR_CODES.PUBLISH_REQUIREMENTS_NOT_MET,
        'Complete your profile and publish at least five works',
      );
    }

    const updated = await this.updateByUserId(userId, {
      publishedAt: new Date(),
    });

    return toProfileView(updated, this.storage);
  }

  async unpublishMine(userId: string): Promise<Profile> {
    await this.ensureProfile(userId);
    const updated = await this.updateByUserId(userId, { publishedAt: null });

    return toProfileView(updated, this.storage);
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<Profile> {
    const avatar = assertAvatarFile(file);
    const profile = await this.ensureProfile(userId);
    const previousKey = profile.avatarKey;
    const key = `avatars/${userId}/${randomUUID()}${extensionForAvatarMime(avatar.mimetype)}`;

    await this.storage.put({
      key,
      body: avatar.buffer,
      contentType: avatar.mimetype,
    });

    const updated = await this.updateByUserId(userId, { avatarKey: key });

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

  private async updateByUserId(
    userId: string,
    data: ProfileWrite,
  ): Promise<ProfileRecord> {
    const updated = await this.prisma.profile.update({
      where: { userId },
      data,
      include: profileInclude,
    });
    return toProfileRecord(updated);
  }

  private toUpdateData(dto: UpdateProfileDto): ProfileWrite {
    return {
      ...(dto.displayName !== undefined
        ? { displayName: dto.displayName }
        : {}),
      ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
      ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
      ...(dto.directions !== undefined
        ? { directions: uniqueDirections(dto.directions) }
        : {}),
      ...(dto.websiteUrl !== undefined ? { websiteUrl: dto.websiteUrl } : {}),
      ...(dto.instagramUrl !== undefined
        ? { instagramUrl: dto.instagramUrl }
        : {}),
      ...(dto.telegramUrl !== undefined
        ? { telegramUrl: dto.telegramUrl }
        : {}),
      ...(dto.acceptPolicies !== undefined
        ? { acceptPolicies: dto.acceptPolicies }
        : {}),
    };
  }

  private async ensureProfile(userId: string): Promise<ProfileRecord> {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
      include: profileInclude,
    });

    if (existing) {
      return toProfileRecord(existing);
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
      return toProfileRecord(
        await this.prisma.profile.create({
          data: { userId },
          include: profileInclude,
        }),
      );
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const raced = await this.prisma.profile.findUnique({
          where: { userId },
          include: profileInclude,
        });
        if (raced) {
          return toProfileRecord(raced);
        }
      }
      throw error;
    }
  }
}

function uniqueDirections(directions: CreatorDirection[]): CreatorDirection[] {
  return [...new Set(directions)];
}
