import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  API_ERROR_CODES,
  type ReorderWorksDto,
  type UpdateWorkDto,
  type Work,
  type WorkFieldsDto,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { normalizeWorkImage } from './work-image';

@Injectable()
export class WorksService {
  private readonly logger = new Logger(WorksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async listMine(userId: string): Promise<Work[]> {
    const works = await this.prisma.work.findMany({
      where: { profile: { userId }, status: { not: 'REMOVED' } },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });
    return works.map((work) => this.toView(work));
  }

  async create(
    userId: string,
    fields: WorkFieldsDto,
    file: Express.Multer.File | undefined,
  ): Promise<Work> {
    const [profile, normalized] = await Promise.all([
      this.prisma.profile.findUnique({ where: { userId } }),
      normalizeWorkImage(file),
    ]);
    if (!profile) {
      throw this.notFound();
    }

    const id = randomUUID();
    const imageKey = `works/${profile.id}/${id}.webp`;
    const thumbnailKey = `works/${profile.id}/${id}-thumb.webp`;
    await this.storage.put({
      key: imageKey,
      body: normalized.image,
      contentType: 'image/webp',
    });
    try {
      await this.storage.put({
        key: thumbnailKey,
        body: normalized.thumbnail,
        contentType: 'image/webp',
      });
      const position = await this.prisma.work.count({
        where: { profileId: profile.id, status: { not: 'REMOVED' } },
      });
      const work = await this.prisma.work.create({
        data: {
          id,
          profileId: profile.id,
          ...fields,
          caption: fields.caption ?? null,
          imageKey,
          thumbnailKey,
          width: normalized.width,
          height: normalized.height,
          position,
        },
      });
      return this.toView(work);
    } catch (error) {
      await Promise.allSettled([
        this.storage.delete(imageKey),
        this.storage.delete(thumbnailKey),
      ]);
      throw error;
    }
  }

  async update(
    userId: string,
    workId: string,
    dto: UpdateWorkDto,
  ): Promise<Work> {
    const work = await this.findOwned(userId, workId);
    const updated = await this.prisma.work.update({
      where: { id: work.id },
      data: dto,
    });
    return this.toView(updated);
  }

  async reorder(userId: string, dto: ReorderWorksDto): Promise<void> {
    const owned = await this.prisma.work.findMany({
      where: {
        id: { in: dto.workIds },
        profile: { userId },
        status: { not: 'REMOVED' },
      },
      select: { id: true },
    });
    if (owned.length !== dto.workIds.length) {
      throw this.notFound();
    }
    await this.prisma.$transaction(
      dto.workIds.map((id, position) =>
        this.prisma.work.update({ where: { id }, data: { position } }),
      ),
    );
  }

  async remove(userId: string, workId: string): Promise<void> {
    const work = await this.findOwned(userId, workId);
    await this.prisma.work.update({
      where: { id: work.id },
      data: { status: 'REMOVED' },
    });
    const results = await Promise.allSettled([
      this.storage.delete(work.imageKey),
      this.storage.delete(work.thumbnailKey),
    ]);
    if (results.some((result) => result.status === 'rejected')) {
      this.logger.warn(`Failed to delete media for removed work ${work.id}`);
    }
  }

  private async findOwned(userId: string, workId: string) {
    const work = await this.prisma.work.findFirst({
      where: { id: workId, profile: { userId }, status: { not: 'REMOVED' } },
    });
    if (!work) {
      throw this.notFound();
    }
    return work;
  }

  private notFound(): ApiHttpException {
    return new ApiHttpException(
      HttpStatus.NOT_FOUND,
      API_ERROR_CODES.NOT_FOUND,
      'Work not found',
    );
  }

  private toView(work: {
    id: string;
    title: string;
    caption: string | null;
    altText: string;
    imageKey: string;
    thumbnailKey: string;
    width: number;
    height: number;
    position: number;
    status: 'DRAFT' | 'PUBLISHED' | 'REMOVED';
  }): Work {
    if (work.status === 'REMOVED') {
      throw this.notFound();
    }
    return {
      id: work.id,
      title: work.title,
      caption: work.caption,
      altText: work.altText,
      imageUrl: this.storage.getPublicUrl(work.imageKey),
      thumbnailUrl: this.storage.getPublicUrl(work.thumbnailKey),
      width: work.width,
      height: work.height,
      position: work.position,
      status: work.status,
    };
  }
}
