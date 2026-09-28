import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  canPublishDialogue,
  type CreateDialogueFields,
  type CursorPage,
  type CursorPageQuery,
  type DialogueSummary,
  type PublicDialogue,
  type UpdateDialogueFields,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';
import { publishedProfileWhere } from '../profiles/published-profile';
import { StorageService } from '../storage/storage.service';
import {
  toDialogueSummary,
  toPublicDialogue,
  type DialogueRecord,
} from './dialogue.mapper';

const workAuthorInclude = {
  profile: {
    select: {
      slug: true,
      displayName: true,
      avatarKey: true,
      directions: true,
      publishedAt: true,
    },
  },
} as const;

const dialogueInclude = {
  leftWork: { include: workAuthorInclude },
  rightWork: { include: workAuthorInclude },
} as const;

const publishedWhere = {
  publishedAt: { not: null },
  hidden: false,
} as const;

@Injectable()
export class DialoguesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async listPublished(
    query: CursorPageQuery,
  ): Promise<CursorPage<DialogueSummary>> {
    const rows = await this.prisma.dialogue.findMany({
      where: publishedWhere,
      orderBy: [
        { featuredAt: { sort: 'desc', nulls: 'last' } },
        { publishedAt: 'desc' },
        { id: 'desc' },
      ],
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: dialogueInclude,
    });
    return this.pageSummaries(rows, query.limit);
  }

  async getPublishedById(id: string): Promise<PublicDialogue> {
    const row = await this.prisma.dialogue.findFirst({
      where: { id, ...publishedWhere },
      include: dialogueInclude,
    });
    const view = row ? toPublicDialogue(row, this.storage) : null;
    if (!view) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.DIALOGUE_NOT_FOUND,
        'Dialogue not found',
      );
    }
    return view;
  }

  async listForCuration(): Promise<DialogueSummary[]> {
    const rows = await this.prisma.dialogue.findMany({
      where: { hidden: false },
      orderBy: [
        { featuredAt: { sort: 'desc', nulls: 'last' } },
        { updatedAt: 'desc' },
      ],
      take: 50,
      include: dialogueInclude,
    });
    return this.mapSummaries(rows);
  }

  async listLive(): Promise<DialogueSummary[]> {
    const rows = await this.prisma.dialogue.findMany({
      where: publishedWhere,
      orderBy: [
        { featuredAt: { sort: 'desc', nulls: 'last' } },
        { updatedAt: 'desc' },
      ],
      take: 50,
      include: dialogueInclude,
    });
    return this.mapSummaries(rows);
  }

  async listHidden(): Promise<DialogueSummary[]> {
    const rows = await this.prisma.dialogue.findMany({
      where: { hidden: true, publishedAt: { not: null } },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: dialogueInclude,
    });
    return this.mapSummaries(rows);
  }

  async create(
    userId: string,
    fields: CreateDialogueFields,
  ): Promise<DialogueSummary> {
    const sides = await this.requirePair(fields.leftWorkId, fields.rightWorkId);
    const created = await this.prisma.dialogue.create({
      data: {
        title: fields.title,
        note: fields.note,
        leftWorkId: sides.left.id,
        rightWorkId: sides.right.id,
        createdByUserId: userId,
      },
      include: dialogueInclude,
    });
    return this.requireSummary(created);
  }

  async update(
    dialogueId: string,
    fields: UpdateDialogueFields,
  ): Promise<DialogueSummary> {
    const existing = await this.requireDialogue(dialogueId);
    const leftWorkId = fields.leftWorkId ?? existing.leftWorkId;
    const rightWorkId = fields.rightWorkId ?? existing.rightWorkId;
    if (fields.leftWorkId !== undefined || fields.rightWorkId !== undefined) {
      await this.requirePair(leftWorkId, rightWorkId);
    }

    const updated = await this.prisma.dialogue.update({
      where: { id: dialogueId },
      data: {
        ...(fields.title !== undefined ? { title: fields.title } : {}),
        ...(fields.note !== undefined ? { note: fields.note } : {}),
        ...(fields.leftWorkId !== undefined
          ? { leftWorkId: fields.leftWorkId }
          : {}),
        ...(fields.rightWorkId !== undefined
          ? { rightWorkId: fields.rightWorkId }
          : {}),
      },
      include: dialogueInclude,
    });
    return this.requireSummary(updated);
  }

  async publish(dialogueId: string): Promise<DialogueSummary> {
    const dialogue = await this.requireDialogue(dialogueId);
    const leftSlug = dialogue.leftWork.profile.slug ?? '';
    const rightSlug = dialogue.rightWork.profile.slug ?? '';
    if (
      !canPublishDialogue({
        title: dialogue.title,
        leftAuthorSlug: leftSlug,
        rightAuthorSlug: rightSlug,
      }) ||
      !dialogue.leftWork.profile.publishedAt ||
      !dialogue.rightWork.profile.publishedAt ||
      dialogue.leftWork.hidden ||
      dialogue.rightWork.hidden
    ) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.DIALOGUE_PUBLISH_REQUIREMENTS_NOT_MET,
        'Dialogue needs two published works from different authors',
      );
    }

    const updated = await this.prisma.dialogue.update({
      where: { id: dialogueId },
      data: {
        publishedAt: dialogue.publishedAt ?? new Date(),
        hidden: false,
      },
      include: dialogueInclude,
    });
    return this.requireSummary(updated);
  }

  async unpublish(dialogueId: string): Promise<DialogueSummary> {
    await this.requireDialogue(dialogueId);
    const updated = await this.prisma.dialogue.update({
      where: { id: dialogueId },
      data: { publishedAt: null, featuredAt: null },
      include: dialogueInclude,
    });
    return this.requireSummary(updated);
  }

  async delete(dialogueId: string): Promise<void> {
    await this.requireDialogue(dialogueId);
    await this.prisma.dialogue.delete({ where: { id: dialogueId } });
  }

  async feature(dialogueId: string): Promise<DialogueSummary> {
    const dialogue = await this.prisma.dialogue.findFirst({
      where: { id: dialogueId, ...publishedWhere },
      include: dialogueInclude,
    });
    if (!dialogue) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.DIALOGUE_NOT_FOUND,
        'Dialogue not found',
      );
    }
    await this.prisma.$transaction([
      this.prisma.dialogue.updateMany({
        where: { featuredAt: { not: null } },
        data: { featuredAt: null },
      }),
      this.prisma.dialogue.update({
        where: { id: dialogueId },
        data: { featuredAt: new Date() },
      }),
    ]);
    const featured = await this.prisma.dialogue.findUniqueOrThrow({
      where: { id: dialogueId },
      include: dialogueInclude,
    });
    return this.requireSummary(featured);
  }

  async unfeature(dialogueId: string): Promise<DialogueSummary> {
    const dialogue = await this.prisma.dialogue.findFirst({
      where: { id: dialogueId, publishedAt: { not: null }, hidden: false },
      include: dialogueInclude,
    });
    if (!dialogue) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.DIALOGUE_NOT_FOUND,
        'Dialogue not found',
      );
    }
    const updated = await this.prisma.dialogue.update({
      where: { id: dialogueId },
      data: { featuredAt: null },
      include: dialogueInclude,
    });
    return this.requireSummary(updated);
  }

  async hide(dialogueId: string): Promise<DialogueSummary> {
    return this.setHidden(dialogueId, true);
  }

  async unhide(dialogueId: string): Promise<DialogueSummary> {
    return this.setHidden(dialogueId, false);
  }

  private async setHidden(
    dialogueId: string,
    hidden: boolean,
  ): Promise<DialogueSummary> {
    const dialogue = await this.prisma.dialogue.findFirst({
      where: { id: dialogueId, publishedAt: { not: null } },
      include: dialogueInclude,
    });
    if (!dialogue) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.DIALOGUE_NOT_FOUND,
        'Dialogue not found',
      );
    }
    const updated = await this.prisma.dialogue.update({
      where: { id: dialogueId },
      data: {
        hidden,
        ...(hidden ? { featuredAt: null } : {}),
      },
      include: dialogueInclude,
    });
    return this.requireSummary(updated);
  }

  private async requireDialogue(id: string) {
    const dialogue = await this.prisma.dialogue.findUnique({
      where: { id },
      include: dialogueInclude,
    });
    if (!dialogue) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.DIALOGUE_NOT_FOUND,
        'Dialogue not found',
      );
    }
    return dialogue;
  }

  private async requirePair(leftWorkId: string, rightWorkId: string) {
    if (leftWorkId === rightWorkId) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.DIALOGUE_SAME_AUTHOR,
        'Dialogue works must be different',
      );
    }

    const [left, right] = await Promise.all([
      this.prisma.work.findFirst({
        where: {
          id: leftWorkId,
          hidden: false,
          profile: publishedProfileWhere,
        },
        include: workAuthorInclude,
      }),
      this.prisma.work.findFirst({
        where: {
          id: rightWorkId,
          hidden: false,
          profile: publishedProfileWhere,
        },
        include: workAuthorInclude,
      }),
    ]);

    if (!left || !right) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.WORK_NOT_FOUND,
        'Dialogue work not found',
      );
    }

    if (left.profileId === right.profileId) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.DIALOGUE_SAME_AUTHOR,
        'Dialogue works must belong to different authors',
      );
    }

    return { left, right };
  }

  private requireSummary(row: DialogueRecord): DialogueSummary {
    const summary = toDialogueSummary(row, this.storage);
    if (!summary) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.DIALOGUE_PUBLISH_REQUIREMENTS_NOT_MET,
        'Dialogue authors must have public profiles',
      );
    }
    return summary;
  }

  private mapSummaries(rows: DialogueRecord[]): DialogueSummary[] {
    return rows
      .map((row) => toDialogueSummary(row, this.storage))
      .filter((row): row is DialogueSummary => row !== null);
  }

  private pageSummaries(
    rows: DialogueRecord[],
    limit: number,
  ): CursorPage<DialogueSummary> {
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const mapped = this.mapSummaries(items);
    return {
      items: mapped,
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    };
  }
}
