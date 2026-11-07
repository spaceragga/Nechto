import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  type NotificationItem,
  type NotificationKind,
  type NotificationList,
  type UnreadCount,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

export type NotifyInput = {
  userId: string;
  kind: NotificationKind;
  actorId: string;
  workId?: string | null;
  projectId?: string | null;
  articleId?: string | null;
  dialogueId?: string | null;
  profileId?: string | null;
  commentId?: string | null;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async notify(input: NotifyInput): Promise<void> {
    if (input.userId === input.actorId) {
      return;
    }
    await this.prisma.notification.create({
      data: {
        userId: input.userId,
        kind: input.kind,
        actorId: input.actorId,
        workId: input.workId ?? null,
        projectId: input.projectId ?? null,
        articleId: input.articleId ?? null,
        dialogueId: input.dialogueId ?? null,
        profileId: input.profileId ?? null,
        commentId: input.commentId ?? null,
      },
    });
  }

  async listMine(userId: string, limit = 40): Promise<NotificationList> {
    const [rows, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          actor: {
            select: {
              id: true,
              profile: {
                select: {
                  slug: true,
                  displayName: true,
                  avatarKey: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

    const workIds = [
      ...new Set(
        rows.map((row) => row.workId).filter((id): id is string => Boolean(id)),
      ),
    ];
    const projectIds = [
      ...new Set(
        rows
          .map((row) => row.projectId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const articleIds = [
      ...new Set(
        rows
          .map((row) => row.articleId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const dialogueIds = [
      ...new Set(
        rows
          .map((row) => row.dialogueId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const profileIds = [
      ...new Set(
        rows
          .map((row) => row.profileId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const [works, projects, articles, dialogues, profiles] = await Promise.all([
      workIds.length
        ? this.prisma.work.findMany({
            where: { id: { in: workIds } },
            select: {
              id: true,
              title: true,
              profile: { select: { slug: true } },
            },
          })
        : Promise.resolve([]),
      projectIds.length
        ? this.prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: {
              id: true,
              title: true,
              profile: { select: { slug: true } },
            },
          })
        : Promise.resolve([]),
      articleIds.length
        ? this.prisma.article.findMany({
            where: { id: { in: articleIds } },
            select: {
              id: true,
              title: true,
              profile: { select: { slug: true } },
            },
          })
        : Promise.resolve([]),
      dialogueIds.length
        ? this.prisma.dialogue.findMany({
            where: { id: { in: dialogueIds } },
            select: { id: true, title: true },
          })
        : Promise.resolve([]),
      profileIds.length
        ? this.prisma.profile.findMany({
            where: { id: { in: profileIds } },
            select: { id: true, slug: true, displayName: true },
          })
        : Promise.resolve([]),
    ]);
    const workById = new Map(works.map((work) => [work.id, work]));
    const projectById = new Map(
      projects.map((project) => [project.id, project]),
    );
    const articleById = new Map(
      articles.map((article) => [article.id, article]),
    );
    const dialogueById = new Map(
      dialogues.map((dialogue) => [dialogue.id, dialogue]),
    );
    const profileById = new Map(
      profiles.map((profile) => [profile.id, profile]),
    );

    const items: NotificationItem[] = rows.map((row) => {
      const work = row.workId ? workById.get(row.workId) : null;
      const project = row.projectId ? projectById.get(row.projectId) : null;
      const article = row.articleId ? articleById.get(row.articleId) : null;
      const dialogue = row.dialogueId ? dialogueById.get(row.dialogueId) : null;
      const profile = row.profileId ? profileById.get(row.profileId) : null;
      const actorProfile = row.actor?.profile;
      return {
        id: row.id,
        kind: row.kind,
        createdAt: row.createdAt.toISOString(),
        readAt: row.readAt?.toISOString() ?? null,
        actor: row.actor
          ? {
              userId: row.actor.id,
              slug: actorProfile?.slug ?? null,
              displayName: actorProfile?.displayName ?? null,
              avatarUrl: actorProfile?.avatarKey
                ? this.storage.getPublicUrl(actorProfile.avatarKey)
                : null,
            }
          : null,
        work: work
          ? {
              id: work.id,
              title: work.title,
              authorSlug: work.profile.slug,
            }
          : null,
        project: project
          ? {
              id: project.id,
              title: project.title,
              authorSlug: project.profile.slug,
            }
          : null,
        article: article
          ? {
              id: article.id,
              title: article.title,
              authorSlug: article.profile.slug,
            }
          : null,
        dialogue: dialogue
          ? {
              id: dialogue.id,
              title: dialogue.title,
            }
          : null,
        profile: profile
          ? {
              id: profile.id,
              slug: profile.slug,
              displayName: profile.displayName,
            }
          : null,
      };
    });

    return { items, unreadCount };
  }

  async unreadCount(userId: string): Promise<UnreadCount> {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { count };
  }

  async markRead(userId: string, id: string): Promise<{ ok: true }> {
    const existing = await this.prisma.notification.findFirst({
      where: { id, userId },
      select: { id: true, readAt: true },
    });
    if (!existing) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.NOTIFICATION_NOT_FOUND,
        'Notification not found',
      );
    }
    if (!existing.readAt) {
      await this.prisma.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });
    }
    return { ok: true };
  }

  async markAllRead(userId: string): Promise<UnreadCount> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { count: 0 };
  }
}
