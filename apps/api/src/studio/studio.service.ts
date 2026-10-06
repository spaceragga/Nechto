import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  canListProfileInStudio,
  type CursorPage,
  type CursorPageQuery,
  type StudioProfileSummary,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';
import { profileInclude as profileUserInclude } from '../profiles/profile.mapper';
import { publishedProfileWhere } from '../profiles/published-profile';
import { StorageService } from '../storage/storage.service';
import { toStudioCandidate, toStudioProfileSummary } from './studio.mapper';

const profileInclude = {
  ...profileUserInclude,
  works: {
    where: { hidden: false },
    orderBy: { id: 'desc' as const },
    take: 4,
  },
};

const publicStudioWhere = {
  ...publishedProfileWhere,
  studioListedAt: { not: null },
  studioHidden: false,
};

@Injectable()
export class StudioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async listPublic(
    query: CursorPageQuery,
  ): Promise<CursorPage<StudioProfileSummary>> {
    const rows = await this.prisma.profile.findMany({
      where: publicStudioWhere,
      orderBy: [
        { studioFeaturedAt: { sort: 'desc', nulls: 'last' } },
        { studioListedAt: 'desc' },
        { id: 'desc' },
      ],
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: profileInclude,
    });
    return this.pageSummaries(rows, query.limit);
  }

  async getPublicBySlug(slug: string): Promise<StudioProfileSummary> {
    const profile = await this.prisma.profile.findFirst({
      where: { ...publicStudioWhere, slug },
      include: {
        ...profileUserInclude,
        works: {
          where: { hidden: false },
          orderBy: { id: 'desc' as const },
          take: 48,
        },
      },
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.STUDIO_PROFILE_NOT_FOUND,
        'Studio profile not found',
      );
    }
    return this.requireSummary(profile);
  }

  async listListedForCuration(): Promise<StudioProfileSummary[]> {
    const rows = await this.prisma.profile.findMany({
      where: {
        studioListedAt: { not: null },
      },
      orderBy: [
        { studioFeaturedAt: { sort: 'desc', nulls: 'last' } },
        { studioListedAt: 'desc' },
      ],
      take: 50,
      include: profileInclude,
    });
    return this.mapSummaries(rows);
  }

  async listCandidatesForCuration(): Promise<StudioProfileSummary[]> {
    const rows = await this.prisma.profile.findMany({
      where: {
        ...publishedProfileWhere,
        studioListedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: profileInclude,
    });
    return rows
      .map((row) => toStudioCandidate(row, this.storage))
      .filter((row): row is StudioProfileSummary => row !== null);
  }

  async listLiveForModeration(): Promise<StudioProfileSummary[]> {
    const rows = await this.prisma.profile.findMany({
      where: publicStudioWhere,
      orderBy: { studioListedAt: 'desc' },
      take: 50,
      include: profileInclude,
    });
    return this.mapSummaries(rows);
  }

  async listHiddenForModeration(): Promise<StudioProfileSummary[]> {
    const rows = await this.prisma.profile.findMany({
      where: {
        studioListedAt: { not: null },
        studioHidden: true,
        publishedAt: { not: null },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: profileInclude,
    });
    return this.mapSummaries(rows);
  }

  async list(profileId: string): Promise<StudioProfileSummary> {
    const profile = await this.requireProfile(profileId);
    const publicProfile = toStudioCandidate(profile, this.storage);
    if (
      !publicProfile ||
      !canListProfileInStudio({
        publishedAt: profile.publishedAt?.toISOString() ?? null,
        slug: profile.slug,
        studioDescription: profile.studioDescription,
        studioCoverKey: profile.studioCoverKey,
      })
    ) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.STUDIO_LIST_REQUIREMENTS_NOT_MET,
        'Studio needs a published profile, cover image, and description',
      );
    }

    const updated = await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        studioListedAt: profile.studioListedAt ?? new Date(),
        studioHidden: false,
      },
      include: profileInclude,
    });
    return this.requireSummary(updated);
  }

  async unlist(profileId: string): Promise<StudioProfileSummary> {
    await this.requireListed(profileId);
    const updated = await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        studioListedAt: null,
        studioFeaturedAt: null,
        studioHidden: false,
      },
      include: profileInclude,
    });
    const candidate = toStudioCandidate(updated, this.storage);
    if (!candidate) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.STUDIO_LIST_REQUIREMENTS_NOT_MET,
        'Studio profile is incomplete',
      );
    }
    return candidate;
  }

  async feature(profileId: string): Promise<StudioProfileSummary> {
    const profile = await this.prisma.profile.findFirst({
      where: { id: profileId, ...publicStudioWhere },
      include: profileInclude,
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.STUDIO_PROFILE_NOT_FOUND,
        'Studio profile not found',
      );
    }

    await this.prisma.$transaction([
      this.prisma.profile.updateMany({
        where: { studioFeaturedAt: { not: null } },
        data: { studioFeaturedAt: null },
      }),
      this.prisma.profile.update({
        where: { id: profileId },
        data: { studioFeaturedAt: new Date() },
      }),
    ]);

    const featured = await this.prisma.profile.findUniqueOrThrow({
      where: { id: profileId },
      include: profileInclude,
    });
    return this.requireSummary(featured);
  }

  async unfeature(profileId: string): Promise<StudioProfileSummary> {
    await this.requireListed(profileId);
    const updated = await this.prisma.profile.update({
      where: { id: profileId },
      data: { studioFeaturedAt: null },
      include: profileInclude,
    });
    return this.requireSummary(updated);
  }

  async hide(profileId: string): Promise<StudioProfileSummary> {
    return this.setHidden(profileId, true);
  }

  async unhide(profileId: string): Promise<StudioProfileSummary> {
    return this.setHidden(profileId, false);
  }

  private async setHidden(
    profileId: string,
    hidden: boolean,
  ): Promise<StudioProfileSummary> {
    const profile = await this.prisma.profile.findFirst({
      where: { id: profileId, studioListedAt: { not: null } },
      include: profileInclude,
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.STUDIO_PROFILE_NOT_FOUND,
        'Studio profile not found',
      );
    }

    const updated = await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        studioHidden: hidden,
        ...(hidden ? { studioFeaturedAt: null } : {}),
      },
      include: profileInclude,
    });
    return this.requireSummary(updated);
  }

  private async requireProfile(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: profileInclude,
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.STUDIO_PROFILE_NOT_FOUND,
        'Studio profile not found',
      );
    }
    return profile;
  }

  private async requireListed(profileId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { id: profileId, studioListedAt: { not: null } },
      include: profileInclude,
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.STUDIO_PROFILE_NOT_FOUND,
        'Studio profile not found',
      );
    }
    return profile;
  }

  private requireSummary(row: Parameters<typeof toStudioProfileSummary>[0]) {
    const summary = toStudioProfileSummary(row, this.storage);
    if (!summary) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.STUDIO_LIST_REQUIREMENTS_NOT_MET,
        'Studio profile is incomplete',
      );
    }
    return summary;
  }

  private mapSummaries(
    rows: Parameters<typeof toStudioProfileSummary>[0][],
  ): StudioProfileSummary[] {
    return rows
      .map((row) => toStudioProfileSummary(row, this.storage))
      .filter((row): row is StudioProfileSummary => row !== null);
  }

  private pageSummaries(
    rows: Parameters<typeof toStudioProfileSummary>[0][],
    limit: number,
  ): CursorPage<StudioProfileSummary> {
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const items = this.mapSummaries(slice);
    return {
      items,
      nextCursor: hasMore ? (slice[slice.length - 1]?.id ?? null) : null,
    };
  }
}
