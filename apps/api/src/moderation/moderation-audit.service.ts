import { Injectable, Logger } from '@nestjs/common';
import type {
  ModerationActionKind,
  ModerationAuditEntry,
  ModerationTargetType,
} from '@nechto/api-contract';
import { PrismaService } from '../prisma/prisma.service';

type RecordInput = {
  actorId: string;
  action: ModerationActionKind;
  targetType: ModerationTargetType;
  targetId: string;
  reportId?: string | null;
};

@Injectable()
export class ModerationAuditService {
  private readonly logger = new Logger(ModerationAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordInput): Promise<void> {
    try {
      await this.prisma.moderationAction.create({
        data: {
          actorId: input.actorId,
          action: input.action,
          targetType: input.targetType,
          targetId: input.targetId,
          reportId: input.reportId ?? null,
        },
      });
    } catch (error) {
      // Mutation already committed; never fail the moderation request for audit I/O.
      this.logger.warn(
        `Failed to record ${input.action} on ${input.targetType}/${input.targetId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async listRecent(limit = 50): Promise<ModerationAuditEntry[]> {
    const rows = await this.prisma.moderationAction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { actor: { select: { id: true, email: true } } },
    });
    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      reportId: row.reportId,
      createdAt: row.createdAt.toISOString(),
      actor: {
        id: row.actor.id,
        email: row.actor.email,
      },
    }));
  }
}
