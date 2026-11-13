import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  type EngagementTargetType,
  type NotificationKind,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import {
  publicWorkWhere,
  publishedProfileWhere,
} from '../profiles/published-profile';
import { PrismaService } from '../prisma/prisma.service';

export type ResolvedPublicTarget = {
  targetType: EngagementTargetType;
  targetId: string;
  ownerUserIds: string[];
  workId: string | null;
  projectId: string | null;
  articleId: string | null;
  dialogueId: string | null;
};

export const LIKE_NOTIFY_KIND: Record<EngagementTargetType, NotificationKind> =
  {
    work: 'work_liked',
    project: 'project_liked',
    article: 'article_liked',
    dialogue: 'dialogue_liked',
  };

@Injectable()
export class PublicTargetService {
  constructor(private readonly prisma: PrismaService) {}

  async require(targetType: EngagementTargetType, targetId: string) {
    switch (targetType) {
      case 'work': {
        const work = await this.prisma.work.findFirst({
          where: publicWorkWhere(targetId),
          select: { id: true, profile: { select: { userId: true } } },
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
        } satisfies ResolvedPublicTarget;
      }
      case 'project': {
        const project = await this.prisma.project.findFirst({
          where: {
            id: targetId,
            hidden: false,
            profile: publishedProfileWhere,
          },
          select: { id: true, profile: { select: { userId: true } } },
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
        } satisfies ResolvedPublicTarget;
      }
      case 'article': {
        const article = await this.prisma.article.findFirst({
          where: {
            id: targetId,
            publishedAt: { not: null },
            hidden: false,
            profile: publishedProfileWhere,
          },
          select: { id: true, profile: { select: { userId: true } } },
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
        } satisfies ResolvedPublicTarget;
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
        } satisfies ResolvedPublicTarget;
      }
    }
  }
}
