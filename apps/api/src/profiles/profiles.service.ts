import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  API_ERROR_CODES,
  HOME_AUTHOR_SELECTION_MAX,
  canListProfileInStudio,
  canPublishProfile,
  type CreatorDirection,
  type CursorPage,
  type ListCreatorsQuery,
  type ModerationProfileSummary,
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
import { createProvisionalSlug, retryUniqueSlug } from './provisional-slug';

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
      orderBy:
        query.sort === 'published'
          ? [{ publishedAt: 'desc' }, { id: 'desc' }]
          : [
              { homeFeaturedAt: { sort: 'desc', nulls: 'last' } },
              { id: 'desc' },
            ],
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: {
        ...profileInclude,
        works: {
          where: { hidden: false },
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

  async listForHomeCuration(): Promise<PublicProfileWithWorks[]> {
    const rows = await this.prisma.profile.findMany({
      where: publishedProfileWhere,
      orderBy: [
        { homeSelectionAt: { sort: 'desc', nulls: 'last' } },
        { homeFeaturedAt: { sort: 'desc', nulls: 'last' } },
        { publishedAt: 'desc' },
      ],
      take: 50,
      include: {
        ...profileInclude,
        works: {
          where: { hidden: false },
          orderBy: { id: 'desc' },
          take: 4,
        },
      },
    });
    return rows.map((row) => ({
      ...toPublicProfile(toProfileRecord(row), this.storage),
      latestWorks: row.works.map((work) => toWorkView(work, this.storage)),
    }));
  }

  async featureHome(slug: string): Promise<PublicProfileWithWorks> {
    const profile = await this.prisma.profile.findFirst({
      where: { ...publishedProfileWhere, slug },
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
    await this.prisma.$transaction([
      this.prisma.profile.updateMany({
        where: { homeFeaturedAt: { not: null } },
        data: { homeFeaturedAt: null },
      }),
      this.prisma.profile.update({
        where: { id: profile.id },
        data: { homeFeaturedAt: new Date() },
      }),
    ]);
    return this.requireHomeCurationView(profile.id);
  }

  async unfeatureHome(slug: string): Promise<PublicProfileWithWorks> {
    const profile = await this.prisma.profile.findFirst({
      where: { ...publishedProfileWhere, slug },
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
    await this.prisma.profile.update({
      where: { id: profile.id },
      data: { homeFeaturedAt: null },
    });
    return this.requireHomeCurationView(profile.id);
  }

  async listHomeSelection(): Promise<PublicProfileWithWorks[]> {
    const rows = await this.prisma.profile.findMany({
      where: {
        ...publishedProfileWhere,
        homeSelectionAt: { not: null },
      },
      orderBy: { homeSelectionAt: 'desc' },
      take: HOME_AUTHOR_SELECTION_MAX,
      include: {
        ...profileInclude,
        works: {
          where: { hidden: false },
          orderBy: { id: 'desc' },
          take: 4,
        },
      },
    });
    return rows.map((row) => ({
      ...toPublicProfile(toProfileRecord(row), this.storage),
      latestWorks: row.works.map((work) => toWorkView(work, this.storage)),
    }));
  }

  async selectHome(slug: string): Promise<PublicProfileWithWorks> {
    const profile = await this.prisma.profile.findFirst({
      where: { ...publishedProfileWhere, slug },
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
    const count = await this.prisma.profile.count({
      where: { homeSelectionAt: { not: null }, ...publishedProfileWhere },
    });
    if (!profile.homeSelectionAt && count >= HOME_AUTHOR_SELECTION_MAX) {
      throw new ApiHttpException(
        HttpStatus.CONFLICT,
        API_ERROR_CODES.AUTHOR_SELECTION_FULL,
        'Author selection is full',
      );
    }
    await this.prisma.profile.update({
      where: { id: profile.id },
      data: { homeSelectionAt: new Date() },
    });
    return this.requireHomeCurationView(profile.id);
  }

  async unselectHome(slug: string): Promise<PublicProfileWithWorks> {
    const profile = await this.prisma.profile.findFirst({
      where: { ...publishedProfileWhere, slug },
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
    await this.prisma.profile.update({
      where: { id: profile.id },
      data: { homeSelectionAt: null },
    });
    return this.requireHomeCurationView(profile.id);
  }

  private async requireHomeCurationView(
    profileId: string,
  ): Promise<PublicProfileWithWorks> {
    const row = await this.prisma.profile.findUniqueOrThrow({
      where: { id: profileId },
      include: {
        ...profileInclude,
        works: {
          where: { hidden: false },
          orderBy: { id: 'desc' },
          take: 4,
        },
      },
    });
    return {
      ...toPublicProfile(toProfileRecord(row), this.storage),
      latestWorks: row.works.map((work) => toWorkView(work, this.storage)),
    };
  }

  async updateMine(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    const current = await this.ensureProfile(userId);
    const data = this.toUpdateData(dto);
    const nextSlug =
      dto.slug !== undefined ? (dto.slug ?? current.slug) : current.slug;
    const nextDisplayName =
      dto.displayName !== undefined ? dto.displayName : current.displayName;
    const nextAcceptPolicies =
      dto.acceptPolicies !== undefined
        ? dto.acceptPolicies
        : current.acceptPolicies;

    if (dto.studioOptIn === true) {
      let publishedAt = current.publishedAt;
      if (!publishedAt) {
        if (
          !canPublishProfile({
            displayName: nextDisplayName,
            slug: nextSlug,
            acceptPolicies: nextAcceptPolicies,
            workCount: current._count?.works ?? 0,
          })
        ) {
          throw new ApiHttpException(
            HttpStatus.BAD_REQUEST,
            API_ERROR_CODES.STUDIO_LIST_REQUIREMENTS_NOT_MET,
            'Studio needs a published profile, cover image, and description',
          );
        }
        publishedAt = new Date();
        data.publishedAt = publishedAt;
      }

      const nextDescription =
        dto.studioDescription !== undefined
          ? dto.studioDescription
          : current.studioDescription;
      const nextCoverKey =
        data.studioCoverKey !== undefined
          ? data.studioCoverKey
          : current.studioCoverKey;

      if (
        !canListProfileInStudio({
          publishedAt: publishedAt.toISOString(),
          slug: nextSlug,
          studioDescription: nextDescription,
          studioCoverKey: nextCoverKey,
        })
      ) {
        throw new ApiHttpException(
          HttpStatus.BAD_REQUEST,
          API_ERROR_CODES.STUDIO_LIST_REQUIREMENTS_NOT_MET,
          'Studio needs a published profile, cover image, and description',
        );
      }
      data.studioListedAt = current.studioListedAt ?? new Date();
      data.studioHidden = false;
    } else if (dto.studioOptIn === false) {
      data.studioListedAt = null;
      data.studioFeaturedAt = null;
      data.studioHidden = false;
    }

    try {
      const profile = await this.updateByUserId(userId, data);

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
        'To publish your profile, enter a name, accept the terms, and upload at least one work',
      );
    }

    const updated = await this.updateByUserId(userId, {
      publishedAt: new Date(),
    });

    return toProfileView(updated, this.storage);
  }

  async unpublishMine(userId: string): Promise<Profile> {
    await this.ensureProfile(userId);
    const updated = await this.updateByUserId(userId, {
      publishedAt: null,
      hidden: false,
      studioListedAt: null,
      studioFeaturedAt: null,
      studioHidden: false,
      homeFeaturedAt: null,
      homeSelectionAt: null,
    });

    return toProfileView(updated, this.storage);
  }

  async listLiveForModeration(): Promise<ModerationProfileSummary[]> {
    return this.listForModeration(false);
  }

  async listHiddenForModeration(): Promise<ModerationProfileSummary[]> {
    return this.listForModeration(true);
  }

  async hide(profileId: string): Promise<ModerationProfileSummary> {
    return this.setHidden(profileId, true);
  }

  async unhide(profileId: string): Promise<ModerationProfileSummary> {
    return this.setHidden(profileId, false);
  }

  private async listForModeration(
    hidden: boolean,
  ): Promise<ModerationProfileSummary[]> {
    const rows = await this.prisma.profile.findMany({
      where: {
        publishedAt: { not: null },
        slug: { not: null },
        hidden,
        user: { suspendedAt: null },
      },
      orderBy: hidden ? { updatedAt: 'desc' } : { publishedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        slug: true,
        displayName: true,
        avatarKey: true,
        publishedAt: true,
        hidden: true,
      },
    });
    return rows.map((row) => this.toModerationSummary(row));
  }

  private async setHidden(
    profileId: string,
    hidden: boolean,
  ): Promise<ModerationProfileSummary> {
    const profile = await this.prisma.profile.findFirst({
      where: {
        id: profileId,
        publishedAt: { not: null },
        slug: { not: null },
        user: { suspendedAt: null },
      },
      select: { id: true },
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }

    const updated = await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        hidden,
        ...(hidden
          ? {
              // Drop home/studio pins; park studio listing so it does not limbo
              // between live and hidden studio desks, and does not auto-return
              // when the profile is unhidden.
              homeFeaturedAt: null,
              homeSelectionAt: null,
              studioFeaturedAt: null,
              studioHidden: true,
            }
          : {}),
      },
      select: {
        id: true,
        slug: true,
        displayName: true,
        avatarKey: true,
        publishedAt: true,
        hidden: true,
      },
    });
    return this.toModerationSummary(updated);
  }

  private toModerationSummary(row: {
    id: string;
    slug: string | null;
    displayName: string | null;
    avatarKey: string | null;
    publishedAt: Date | null;
    hidden: boolean;
  }): ModerationProfileSummary {
    return {
      profileId: row.id,
      slug: row.slug ?? '',
      displayName: row.displayName,
      avatarUrl: row.avatarKey
        ? this.storage.getPublicUrl(row.avatarKey)
        : null,
      publishedAt: row.publishedAt?.toISOString() ?? '',
      hidden: row.hidden,
    };
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

  async uploadStudioCover(
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<Profile> {
    const cover = assertAvatarFile(file);
    const profile = await this.ensureProfile(userId);
    const previousKey = profile.studioCoverKey;
    const key = `studio/${userId}/${randomUUID()}${extensionForAvatarMime(cover.mimetype)}`;

    await this.storage.put({
      key,
      body: cover.buffer,
      contentType: cover.mimetype,
    });

    const updated = await this.updateByUserId(userId, {
      studioCoverKey: key,
    });

    if (previousKey && previousKey !== key) {
      try {
        await this.storage.delete(previousKey);
      } catch (error) {
        this.logger.warn(
          `Failed to delete previous studio cover key ${previousKey}`,
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
      ...(dto.slug ? { slug: dto.slug } : {}),
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
      ...(dto.studioTitle !== undefined
        ? { studioTitle: dto.studioTitle }
        : {}),
      ...(dto.studioDescription !== undefined
        ? { studioDescription: dto.studioDescription }
        : {}),
    };
  }

  private async ensureProfile(userId: string): Promise<ProfileRecord> {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
      include: profileInclude,
    });

    if (existing) {
      if (existing.slug) {
        return toProfileRecord(existing);
      }

      const filled = await retryUniqueSlug(() =>
        this.prisma.profile.update({
          where: { userId },
          data: { slug: createProvisionalSlug() },
          include: profileInclude,
        }),
      );
      return toProfileRecord(filled);
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
        await retryUniqueSlug(() =>
          this.prisma.profile.create({
            data: { userId, slug: createProvisionalSlug() },
            include: profileInclude,
          }),
        ),
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
