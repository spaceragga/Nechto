import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  API_ERROR_CODES,
  PUBLISH_MIN_WORKS,
  type CreateWorkFields,
  type CursorPage,
  type CursorPageQuery,
  type Work,
  type WorkWithAuthor,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { publishedProfileWhere } from '../profiles/published-profile';
import { extensionForImageMime } from '../storage/image-file';
import { assertWorkFile } from './work-file';
import { toWorkView, toWorkWithAuthorView } from './work.mapper';

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
    query: CursorPageQuery,
  ): Promise<CursorPage<WorkWithAuthor>> {
    const rows = await this.prisma.work.findMany({
      where: {
        profile: publishedProfileWhere,
      },
      orderBy: { id: 'desc' },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: {
        profile: {
          select: {
            slug: true,
            displayName: true,
            avatarKey: true,
          },
        },
      },
    });

    const mapped = rows
      .map((row) => toWorkWithAuthorView(row, this.storage))
      .filter((row): row is WorkWithAuthor => row !== null);
    const hasMore = mapped.length > query.limit;
    const items = hasMore ? mapped.slice(0, query.limit) : mapped;

    return {
      items,
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    };
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
      where: { profileId: profile.id },
      orderBy: { id: 'desc' },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
    });

    return this.pageWorks(rows, query.limit);
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
        imageKey: key,
      },
    });

    return toWorkView(work, this.storage);
  }

  async deleteMine(userId: string, workId: string): Promise<void> {
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

  private pageWorks(
    rows: Array<{
      id: string;
      title: string;
      imageKey: string;
      createdAt: Date;
    }>,
    limit: number,
  ): CursorPage<Work> {
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: slice.map((row) => toWorkView(row, this.storage)),
      nextCursor: hasMore ? (slice[slice.length - 1]?.id ?? null) : null,
    };
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
