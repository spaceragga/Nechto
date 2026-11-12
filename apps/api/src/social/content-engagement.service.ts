import { Injectable } from '@nestjs/common';
import type { EngagementQuery, EngagementSnapshot } from '@nechto/api-contract';
import { isUniqueConstraintError } from '../prisma/is-unique-constraint-error';
import { PrismaService } from '../prisma/prisma.service';
import { PublicTargetService } from './resolve-public-target';

@Injectable()
export class ContentEngagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly targets: PublicTargetService,
  ) {}

  async snapshot(
    query: EngagementQuery,
    userId: string | null,
  ): Promise<EngagementSnapshot> {
    const target = await this.targets.require(query.targetType, query.targetId);
    return this.counts(target.targetType, target.targetId, userId);
  }

  async recordView(
    query: EngagementQuery,
    viewerKey: string,
    userId: string | null,
  ): Promise<EngagementSnapshot> {
    const target = await this.targets.require(query.targetType, query.targetId);
    try {
      await this.prisma.contentView.upsert({
        where: {
          viewerKey_targetType_targetId: {
            viewerKey,
            targetType: target.targetType,
            targetId: target.targetId,
          },
        },
        create: {
          viewerKey,
          userId,
          targetType: target.targetType,
          targetId: target.targetId,
        },
        update: {},
      });
    } catch (error) {
      // Two parallel records of the same viewer hit the unique key together.
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
    }
    return this.counts(target.targetType, target.targetId, userId);
  }

  async counts(
    targetType: string,
    targetId: string,
    userId: string | null,
  ): Promise<EngagementSnapshot> {
    const where = { targetType, targetId };
    const [likeCount, viewCount, liked] = await Promise.all([
      this.prisma.contentLike.count({ where }),
      this.prisma.contentView.count({ where }),
      userId
        ? this.prisma.contentLike.findUnique({
            where: {
              userId_targetType_targetId: { userId, targetType, targetId },
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);
    return {
      likeCount,
      viewCount,
      likedByMe: Boolean(liked),
    };
  }
}
