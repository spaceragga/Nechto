import { Injectable } from '@nestjs/common';
import type {
  AuthUser,
  EngagementQuery,
  EngagementSnapshot,
} from '@nechto/api-contract';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ContentEngagementService } from './content-engagement.service';
import { LIKE_NOTIFY_KIND, PublicTargetService } from './resolve-public-target';

@Injectable()
export class EngagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly targets: PublicTargetService,
    private readonly content: ContentEngagementService,
    private readonly notifications: NotificationsService,
  ) {}

  async like(
    query: EngagementQuery,
    user: AuthUser,
  ): Promise<EngagementSnapshot> {
    const target = await this.targets.require(query.targetType, query.targetId);
    const existing = await this.prisma.contentLike.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: target.targetType,
          targetId: target.targetId,
        },
      },
      select: { id: true },
    });
    if (!existing) {
      await this.prisma.contentLike.create({
        data: {
          userId: user.id,
          targetType: target.targetType,
          targetId: target.targetId,
        },
      });
      await Promise.all(
        [...new Set(target.ownerUserIds)].map((ownerId) =>
          this.notifications.notify({
            userId: ownerId,
            kind: LIKE_NOTIFY_KIND[target.targetType],
            actorId: user.id,
            workId: target.workId,
            projectId: target.projectId,
            articleId: target.articleId,
            dialogueId: target.dialogueId,
          }),
        ),
      );
    }
    return this.content.counts(target.targetType, target.targetId, user.id);
  }

  async unlike(
    query: EngagementQuery,
    user: AuthUser,
  ): Promise<EngagementSnapshot> {
    const target = await this.targets.require(query.targetType, query.targetId);
    await this.prisma.contentLike.deleteMany({
      where: {
        userId: user.id,
        targetType: target.targetType,
        targetId: target.targetId,
      },
    });
    return this.content.counts(target.targetType, target.targetId, user.id);
  }
}
