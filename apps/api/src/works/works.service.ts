import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  API_ERROR_CODES,
  HOME_HANGING_MAX,
  PUBLISH_MIN_WORKS,
  type CreateWorkFields,
  type CursorPage,
  type CursorPageQuery,
  type ListPublishedWorksQuery,
  type UpdateWorkFields,
  type Work,
  type WorkWithAuthor,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { publishedProfileWhere } from '../profiles/published-profile';
import { extensionForImageMime } from '../storage/image-file';
import { assertWorkFile } from './work-file';
import {
  toWorkView,
  toWorkWithAuthorView,
  type WorkRecord,
} from './work.mapper';

const publishedAuthorSelect = {
  slug: true,
  displayName: true,
  avatarKey: true,
  directions: true,
} as const;

@Injectable()
export class WorksService {
  private readonly logger = new Logger(WorksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async listMine(
    userId: string,
    query: CursorPageQuery,
  ): Promise<CursorPage<Work>> {
    const profile = await this.requireProfile(userId);
    const rows = await this.prisma.work.findMany({
      where: { profileId: profile.id },
      orderBy: { id: 'desc' },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
    });

    return this.pageWorks(rows, query.limit);
  }

  async listPublished(
    query: ListPublishedWorksQuery,
  ): Promise<CursorPage<WorkWithAuthor>> {
    const rows = await this.prisma.work.findMany({
      where: {
        hidden: false,
        profile: {
          ...publishedProfileWhere,
          ...(query.direction ? { directions: { has: query.direction } } : {}),
        },
      },
      orderBy: { id: 'desc' },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: {
        profile: {
          select: publishedAuthorSelect,
        },
      },
    });

    return this.pagePublished(rows, query.limit);
  }

  /** Curator pairing desk: recent published works, optional title/author search. */
  async listForCuration(query: {
    q: string;
    limit: number;
  }): Promise<CursorPage<WorkWithAuthor>> {
    const needle = query.q.trim();
    const rows = await this.prisma.work.findMany({
      where: {
        hidden: false,
        profile: publishedProfileWhere,
        ...(needle
          ? {
              OR: [
                { title: { contains: needle, mode: 'insensitive' } },
                {
                  profile: {
                    displayName: { contains: needle, mode: 'insensitive' },
                  },
                },
                {
                  profile: {
                    slug: { contains: needle, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit + 1,
      include: {
        profile: {
          select: publishedAuthorSelect,
        },
      },
    });

    return this.pagePublished(rows, query.limit);
  }

  async listPublishedBySlug(
    slug: string,
    query: CursorPageQuery,
  ): Promise<CursorPage<Work>> {
    const profile = await this.prisma.profile.findFirst({
      where: { ...publishedProfileWhere, slug },
      select: { id: true },
    });

    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }

    const rows = await this.prisma.work.findMany({
      where: { profileId: profile.id, hidden: false },
      orderBy: { id: 'desc' },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
    });

    return this.pageWorks(rows, query.limit);
  }

  async getPublishedById(id: string): Promise<WorkWithAuthor> {
    const row = await this.prisma.work.findFirst({
      where: {
        id,
        profile: publishedProfileWhere,
      },
      include: {
        profile: {
          select: publishedAuthorSelect,
        },
      },
    });

    const view = row ? toWorkWithAuthorView(row, this.storage) : null;
    if (!view) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.WORK_NOT_FOUND,
        'Work not found',
      );
    }

    return view;
  }

  async createMine(
    userId: string,
    file: Express.Multer.File | undefined,
    fields: CreateWorkFields,
  ): Promise<Work> {
    const image = assertWorkFile(file);
    const profile = await this.requireProfile(userId);
    const key = `works/${profile.id}/${randomUUID()}${extensionForImageMime(image.mimetype)}`;

    await this.storage.put({
      key,
      body: image.buffer,
      contentType: image.mimetype,
    });

    const work = await this.prisma.work.create({
      data: {
        profileId: profile.id,
        title: fields.title,
        description: fields.description,
        imageKey: key,
      },
    });

    return toWorkView(work, this.storage);
  }

  async updateMine(
    userId: string,
    workId: string,
    fields: UpdateWorkFields,
  ): Promise<Work> {
    const work = await this.requireOwnedWork(userId, workId);
    const updated = await this.prisma.work.update({
      where: { id: work.id },
      data: {
        ...(fields.title !== undefined ? { title: fields.title } : {}),
        ...(fields.description !== undefined
          ? { description: fields.description }
          : {}),
        ...(fields.hidden !== undefined ? { hidden: fields.hidden } : {}),
      },
    });

    return toWorkView(updated, this.storage);
  }

  async getBillboard(): Promise<WorkWithAuthor | null> {
    const row = await this.prisma.work.findFirst({
      where: {
        hidden: false,
        featuredAt: { not: null },
        profile: publishedProfileWhere,
      },
      orderBy: { featuredAt: 'desc' },
      include: { profile: { select: publishedAuthorSelect } },
    });
    return row ? toWorkWithAuthorView(row, this.storage) : null;
  }

  async listHangings(): Promise<WorkWithAuthor[]> {
    const rows = await this.prisma.work.findMany({
      where: {
        hidden: false,
        hangingAt: { not: null },
        profile: publishedProfileWhere,
      },
      orderBy: { hangingAt: 'desc' },
      take: HOME_HANGING_MAX,
      include: { profile: { select: publishedAuthorSelect } },
    });
    return rows
      .map((row) => toWorkWithAuthorView(row, this.storage))
      .filter((row): row is WorkWithAuthor => row !== null);
  }

  async listLiveForModeration(): Promise<WorkWithAuthor[]> {
    const rows = await this.prisma.work.findMany({
      where: { hidden: false, profile: publishedProfileWhere },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { profile: { select: publishedAuthorSelect } },
    });
    return rows
      .map((row) => toWorkWithAuthorView(row, this.storage))
      .filter((row): row is WorkWithAuthor => row !== null);
  }

  async listHiddenForModeration(): Promise<WorkWithAuthor[]> {
    const rows = await this.prisma.work.findMany({
      where: { hidden: true, profile: publishedProfileWhere },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: { profile: { select: publishedAuthorSelect } },
    });
    return rows
      .map((row) => toWorkWithAuthorView(row, this.storage))
      .filter((row): row is WorkWithAuthor => row !== null);
  }

  async featureBillboard(workId: string): Promise<WorkWithAuthor> {
    await this.requirePublishedWork(workId);
    await this.prisma.$transaction([
      this.prisma.work.updateMany({
        where: { featuredAt: { not: null } },
        data: { featuredAt: null },
      }),
      this.prisma.work.update({
        where: { id: workId },
        data: { featuredAt: new Date() },
      }),
    ]);
    return this.requirePublishedWorkView(workId);
  }

  async unfeatureBillboard(workId: string): Promise<WorkWithAuthor> {
    await this.requirePublishedWork(workId);
    await this.prisma.work.update({
      where: { id: workId },
      data: { featuredAt: null },
    });
    return this.requirePublishedWorkView(workId);
  }

  async hang(workId: string): Promise<WorkWithAuthor> {
    await this.requirePublishedWork(workId);
    const count = await this.prisma.work.count({
      where: { hangingAt: { not: null }, hidden: false },
    });
    const current = await this.prisma.work.findUnique({
      where: { id: workId },
      select: { hangingAt: true },
    });
    if (!current?.hangingAt && count >= HOME_HANGING_MAX) {
      throw new ApiHttpException(
        HttpStatus.CONFLICT,
        API_ERROR_CODES.HANGING_FULL,
        'Hanging strip is full',
      );
    }
    await this.prisma.work.update({
      where: { id: workId },
      data: { hangingAt: new Date() },
    });
    return this.requirePublishedWorkView(workId);
  }

  async unhang(workId: string): Promise<WorkWithAuthor> {
    await this.requirePublishedWork(workId);
    await this.prisma.work.update({
      where: { id: workId },
      data: { hangingAt: null },
    });
    return this.requirePublishedWorkView(workId);
  }

  async hide(workId: string): Promise<WorkWithAuthor> {
    return this.setHidden(workId, true);
  }

  async unhide(workId: string): Promise<WorkWithAuthor> {
    return this.setHidden(workId, false);
  }

  private async setHidden(
    workId: string,
    hidden: boolean,
  ): Promise<WorkWithAuthor> {
    const work = await this.prisma.work.findFirst({
      where: { id: workId, profile: publishedProfileWhere },
    });
    if (!work) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.WORK_NOT_FOUND,
        'Work not found',
      );
    }
    await this.prisma.work.update({
      where: { id: workId },
      data: {
        hidden,
        ...(hidden ? { featuredAt: null, hangingAt: null } : {}),
      },
    });
    const row = await this.prisma.work.findUniqueOrThrow({
      where: { id: workId },
      include: { profile: { select: publishedAuthorSelect } },
    });
    const view = toWorkWithAuthorView(row, this.storage);
    if (!view) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.WORK_NOT_FOUND,
        'Work not found',
      );
    }
    return view;
  }

  private async requirePublishedWork(workId: string) {
    const work = await this.prisma.work.findFirst({
      where: {
        id: workId,
        hidden: false,
        profile: publishedProfileWhere,
      },
    });
    if (!work) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.WORK_NOT_FOUND,
        'Work not found',
      );
    }
    return work;
  }

  private async requirePublishedWorkView(
    workId: string,
  ): Promise<WorkWithAuthor> {
    const row = await this.prisma.work.findUniqueOrThrow({
      where: { id: workId },
      include: { profile: { select: publishedAuthorSelect } },
    });
    const view = toWorkWithAuthorView(row, this.storage);
    if (!view) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.WORK_NOT_FOUND,
        'Work not found',
      );
    }
    return view;
  }

  async deleteMine(userId: string, workId: string): Promise<void> {
    const profile = await this.requireProfile(userId);
    const work = await this.requireOwnedWork(userId, workId);

    const usedInProject = await this.prisma.projectBlock.count({
      where: { workId: work.id },
    });
    if (usedInProject > 0) {
      throw new ApiHttpException(
        HttpStatus.CONFLICT,
        API_ERROR_CODES.WORK_IN_PROJECT,
        'Work is used in a project',
      );
    }

    await this.prisma.work.delete({ where: { id: work.id } });

    try {
      await this.storage.delete(work.imageKey);
    } catch (error) {
      this.logger.warn(
        `Failed to delete work image ${work.imageKey}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    const remaining = await this.prisma.work.count({
      where: { profileId: profile.id },
    });

    if (profile.publishedAt && remaining < PUBLISH_MIN_WORKS) {
      await this.prisma.profile.update({
        where: { id: profile.id },
        data: { publishedAt: null },
      });
    }
  }

  private pageWorks(rows: WorkRecord[], limit: number): CursorPage<Work> {
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: slice.map((row) => toWorkView(row, this.storage)),
      nextCursor: hasMore ? (slice[slice.length - 1]?.id ?? null) : null,
    };
  }

  private pagePublished(
    rows: Array<
      WorkRecord & {
        profile: {
          slug: string | null;
          displayName: string | null;
          avatarKey: string | null;
          directions: string[];
        };
      }
    >,
    limit: number,
  ): CursorPage<WorkWithAuthor> {
    const mapped = rows
      .map((row) => toWorkWithAuthorView(row, this.storage))
      .filter((row): row is WorkWithAuthor => row !== null);
    const hasMore = mapped.length > limit;
    const items = hasMore ? mapped.slice(0, limit) : mapped;
    return {
      items,
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    };
  }

  private async requireOwnedWork(userId: string, workId: string) {
    const profile = await this.requireProfile(userId);
    const work = await this.prisma.work.findFirst({
      where: { id: workId, profileId: profile.id },
    });

    if (!work) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.WORK_NOT_FOUND,
        'Work not found',
      );
    }

    return work;
  }

  private async requireProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
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
