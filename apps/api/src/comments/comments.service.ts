import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  type AuthUser,
  type CommentTargetType,
  type CommentView,
  type CreateCommentDto,
  type CursorPage,
  type ListCommentsQuery,
  type NotificationKind,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { NotificationsService } from '../notifications/notifications.service';
import { publishedProfileWhere } from '../profiles/published-profile';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  commentAuthorSelect,
  toCommentView,
  type CommentRecord,
} from './comment.mapper';

type ResolvedTarget = {
  targetType: CommentTargetType;
  targetId: string;
  ownerUserIds: string[];
  workId: string | null;
  projectId: string | null;
  articleId: string | null;
  dialogueId: string | null;
};

const COMMENT_NOTIFY_KIND: Record<CommentTargetType, NotificationKind> = {
  work: 'work_commented',
  project: 'project_commented',
  article: 'article_commented',
  dialogue: 'dialogue_commented',
};

const commentInclude = {
  author: { select: commentAuthorSelect },
} as const;

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(
    query: ListCommentsQuery,
    user: AuthUser | null,
  ): Promise<CursorPage<CommentView>> {
    const target = await this.requirePublicTarget(
      query.targetType,
      query.targetId,
    );
    const ownerIds = new Set(target.ownerUserIds);
    const rows = await this.prisma.comment.findMany({
      where: this.targetWhere(target),
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      include: commentInclude,
    });
    const hasMore = rows.length > query.limit;
    const slice = hasMore ? rows.slice(0, query.limit) : rows;
    return {
      items: slice.map((row) =>
        toCommentView(row, this.storage, this.canDelete(row, user, ownerIds)),
      ),
      nextCursor: hasMore ? (slice[slice.length - 1]?.id ?? null) : null,
    };
  }

  async create(dto: CreateCommentDto, user: AuthUser): Promise<CommentView> {
    const target = await this.requirePublicTarget(dto.targetType, dto.targetId);
    const row = await this.prisma.comment.create({
      data: {
        authorId: user.id,
        body: dto.body,
        workId: target.workId,
        projectId: target.projectId,
        articleId: target.articleId,
        dialogueId: target.dialogueId,
      },
      include: commentInclude,
    });
    const ownerIds = [...new Set(target.ownerUserIds)];
    await Promise.all(
      ownerIds.map((ownerId) =>
        this.notifications.notify({
          userId: ownerId,
          kind: COMMENT_NOTIFY_KIND[target.targetType],
          actorId: user.id,
          workId: target.workId,
          projectId: target.projectId,
          articleId: target.articleId,
          dialogueId: target.dialogueId,
          commentId: row.id,
        }),
      ),
    );
    return toCommentView(row, this.storage, true);
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    const row = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        ...commentInclude,
        work: { select: { profile: { select: { userId: true } } } },
        project: { select: { profile: { select: { userId: true } } } },
        article: { select: { profile: { select: { userId: true } } } },
        dialogue: {
          select: {
            createdByUserId: true,
            leftWork: { select: { profile: { select: { userId: true } } } },
            rightWork: { select: { profile: { select: { userId: true } } } },
          },
        },
      },
    });
    if (!row) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.COMMENT_NOT_FOUND,
        'Comment not found',
      );
    }
    const ownerIds = new Set(this.ownerIdsFromRow(row));
    if (!this.canDelete(row, user, ownerIds)) {
      throw new ApiHttpException(
        HttpStatus.FORBIDDEN,
        API_ERROR_CODES.FORBIDDEN,
        'Forbidden',
      );
    }
    await this.prisma.comment.delete({ where: { id } });
  }

  private canDelete(
    row: Pick<CommentRecord, 'authorId'>,
    user: AuthUser | null,
    ownerIds: Set<string>,
  ): boolean {
    if (!user) {
      return false;
    }
    return (
      user.id === row.authorId ||
      ownerIds.has(user.id) ||
      user.isModerator ||
      user.isAdmin
    );
  }

  private ownerIdsFromRow(row: {
    work: { profile: { userId: string } } | null;
    project: { profile: { userId: string } } | null;
    article: { profile: { userId: string } } | null;
    dialogue: {
      createdByUserId: string | null;
      leftWork: { profile: { userId: string } };
      rightWork: { profile: { userId: string } };
    } | null;
  }): string[] {
    if (row.work) {
      return [row.work.profile.userId];
    }
    if (row.project) {
      return [row.project.profile.userId];
    }
    if (row.article) {
      return [row.article.profile.userId];
    }
    if (row.dialogue) {
      return [
        row.dialogue.leftWork.profile.userId,
        row.dialogue.rightWork.profile.userId,
        ...(row.dialogue.createdByUserId ? [row.dialogue.createdByUserId] : []),
      ];
    }
    return [];
  }

  private targetWhere(target: ResolvedTarget) {
    switch (target.targetType) {
      case 'work':
        return { workId: target.targetId };
      case 'project':
        return { projectId: target.targetId };
      case 'article':
        return { articleId: target.targetId };
      case 'dialogue':
        return { dialogueId: target.targetId };
    }
  }

  private async requirePublicTarget(
    targetType: CommentTargetType,
    targetId: string,
  ): Promise<ResolvedTarget> {
    switch (targetType) {
      case 'work': {
        const work = await this.prisma.work.findFirst({
          where: {
            id: targetId,
            hidden: false,
            profile: publishedProfileWhere,
          },
          select: {
            id: true,
            profile: { select: { userId: true } },
          },
        });
        if (!work) {
          throw new ApiHttpException(
            HttpStatus.NOT_FOUND,
            API_ERROR_CODES.WORK_NOT_FOUND,
            'Work not found',
          );
        }
        return {
          targetType,
          targetId: work.id,
          ownerUserIds: [work.profile.userId],
          workId: work.id,
          projectId: null,
          articleId: null,
          dialogueId: null,
        };
      }
      case 'project': {
        const project = await this.prisma.project.findFirst({
          where: {
            id: targetId,
            hidden: false,
            profile: publishedProfileWhere,
          },
          select: {
            id: true,
            profile: { select: { userId: true } },
          },
        });
        if (!project) {
          throw new ApiHttpException(
            HttpStatus.NOT_FOUND,
            API_ERROR_CODES.PROJECT_NOT_FOUND,
            'Project not found',
          );
        }
        return {
          targetType,
          targetId: project.id,
          ownerUserIds: [project.profile.userId],
          workId: null,
          projectId: project.id,
          articleId: null,
          dialogueId: null,
        };
      }
      case 'article': {
        const article = await this.prisma.article.findFirst({
          where: {
            id: targetId,
            publishedAt: { not: null },
            hidden: false,
            profile: publishedProfileWhere,
          },
          select: {
            id: true,
            profile: { select: { userId: true } },
          },
        });
        if (!article) {
          throw new ApiHttpException(
            HttpStatus.NOT_FOUND,
            API_ERROR_CODES.ARTICLE_NOT_FOUND,
            'Article not found',
          );
        }
        return {
          targetType,
          targetId: article.id,
          ownerUserIds: [article.profile.userId],
          workId: null,
          projectId: null,
          articleId: article.id,
          dialogueId: null,
        };
      }
      case 'dialogue': {
        const dialogue = await this.prisma.dialogue.findFirst({
          where: {
            id: targetId,
            publishedAt: { not: null },
            hidden: false,
          },
          select: {
            id: true,
            createdByUserId: true,
            leftWork: {
              select: {
                profile: { select: { userId: true, publishedAt: true } },
              },
            },
            rightWork: {
              select: {
                profile: { select: { userId: true, publishedAt: true } },
              },
            },
          },
        });
        if (
          !dialogue ||
          !dialogue.leftWork.profile.publishedAt ||
          !dialogue.rightWork.profile.publishedAt
        ) {
          throw new ApiHttpException(
            HttpStatus.NOT_FOUND,
            API_ERROR_CODES.DIALOGUE_NOT_FOUND,
            'Dialogue not found',
          );
        }
        return {
          targetType,
          targetId: dialogue.id,
          ownerUserIds: [
            dialogue.leftWork.profile.userId,
            dialogue.rightWork.profile.userId,
            ...(dialogue.createdByUserId ? [dialogue.createdByUserId] : []),
          ],
          workId: null,
          projectId: null,
          articleId: null,
          dialogueId: dialogue.id,
        };
      }
    }
  }
}
