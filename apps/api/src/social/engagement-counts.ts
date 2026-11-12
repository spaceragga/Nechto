import type { PrismaService } from '../prisma/prisma.service';

export type EngagementCounts = {
  likeCount: number;
  viewCount: number;
};

type CountClient = Pick<PrismaService, 'contentLike' | 'contentView'>;

async function countEngagement(
  prisma: CountClient,
  targetType: 'work' | 'project' | 'article' | 'dialogue',
  ids: string[],
): Promise<Map<string, EngagementCounts>> {
  const counts = new Map<string, EngagementCounts>(
    ids.map((id) => [id, { likeCount: 0, viewCount: 0 }]),
  );
  if (ids.length === 0) {
    return counts;
  }

  const where = { targetType, targetId: { in: ids } };
  const [likes, views] = await Promise.all([
    prisma.contentLike.groupBy({
      by: ['targetId'],
      where,
      _count: { _all: true },
    }),
    prisma.contentView.groupBy({
      by: ['targetId'],
      where,
      _count: { _all: true },
    }),
  ]);

  for (const row of likes) {
    const current = counts.get(row.targetId);
    if (current) {
      current.likeCount = row._count._all;
    }
  }
  for (const row of views) {
    const current = counts.get(row.targetId);
    if (current) {
      current.viewCount = row._count._all;
    }
  }
  return counts;
}

export async function withEngagementCounts<T extends { id: string }>(
  prisma: CountClient,
  targetType: 'work' | 'project' | 'article' | 'dialogue',
  items: T[],
): Promise<Array<T & EngagementCounts>> {
  const counts = await countEngagement(
    prisma,
    targetType,
    items.map((item) => item.id),
  );
  return items.map((item) => ({
    ...item,
    likeCount: counts.get(item.id)?.likeCount ?? 0,
    viewCount: counts.get(item.id)?.viewCount ?? 0,
  }));
}
