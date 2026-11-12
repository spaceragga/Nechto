'use strict';

/**
 * Deterministic social activity for the seeded artists.
 * Safe to re-run: clears likes, views, comments, follows, and notifications,
 * then rebuilds them. Counts are derived from the rows, not stored columns.
 *
 * artist2 does not follow kasia-voit and does not like her works.
 * Playwright social.spec.ts signs in as that account and expects both
 * actions to still be available.
 */

const { randomBytes } = require('node:crypto');
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

const PLAYWRIGHT_VISITOR_EMAIL = 'artist2@nechto.test';
const PLAYWRIGHT_AUTHOR_SLUG = 'kasia-voit';

const COMMENT_BODIES = [
  'Сильный кадр. Свет как раз тот.',
  'Хочу так же спокойно снимать.',
  'Это очень минское.',
  'Оставила бы на стене.',
  'Пауза в кадре — то, чего не хватает ленте.',
  'Смотрю уже третий раз.',
  'Тихо и точно.',
  'Руки и свет важнее позы.',
  'Зашла сюда за этим настроением.',
  'Без лишнего — и правильно.',
  'Хочется пройтись туда же.',
  'Тёплый тон, живой.',
  'Как будто знакомый двор.',
  'Коротко и по делу — нравится.',
  'Серия цепляет целиком.',
];

function hash32(input) {
  let hash = 2166136261;
  const text = String(input);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function commentCountFor(id) {
  const roll = hash32(`${id}:comments`) % 100;
  if (roll < 35) return 0;
  if (roll < 55) return 1;
  if (roll < 72) return 2;
  if (roll < 86) return 3;
  if (roll < 95) return 4;
  return 5;
}

function likeCountFor(id, maxLikers) {
  if (maxLikers <= 0) return 0;
  const roll = hash32(`${id}:likes`) % 100;
  let target;
  if (roll < 12) target = 0;
  else if (roll < 28) target = 1;
  else if (roll < 48) target = 2;
  else if (roll < 68) target = 3;
  else if (roll < 84) target = 4;
  else if (roll < 94) target = 5;
  else target = 6 + (roll % 3);
  return Math.min(target, maxLikers);
}

function viewTargetFor(id, likeCount) {
  const bump = 2 + (hash32(`${id}:views`) % 14);
  const noise = hash32(`${id}:view-noise`) % 9;
  return likeCount + bump + noise;
}

function pickActors(seed, actors, count) {
  if (count <= 0 || actors.length === 0) return [];
  const ranked = [...actors].sort(
    (left, right) =>
      hash32(`${seed}:${left.userId}`) - hash32(`${seed}:${right.userId}`),
  );
  return ranked.slice(0, Math.min(count, ranked.length));
}

function commentBody(seed, index) {
  return COMMENT_BODIES[
    hash32(`${seed}:body:${index}`) % COMMENT_BODIES.length
  ];
}

function daysAgo(seed, maxDays) {
  const days = hash32(`${seed}:age`) % (maxDays + 1);
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function newId() {
  return randomBytes(12).toString('hex');
}

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return;
  }
  try {
    const { config } = require('dotenv');
    for (const envPath of [
      resolve(__dirname, '../../../.env'),
      resolve(__dirname, '../.env'),
      resolve(process.cwd(), '.env'),
    ]) {
      if (existsSync(envPath)) {
        config({ path: envPath });
        if (process.env.DATABASE_URL) {
          return;
        }
      }
    }
  } catch {
    // Host seed still has the compose default below.
  }
  process.env.DATABASE_URL = 'postgresql://nechto:nechto@localhost:5432/nechto';
}

async function createMany(model, rows) {
  const size = 500;
  for (let index = 0; index < rows.length; index += size) {
    await model.createMany({ data: rows.slice(index, index + size) });
  }
}

async function clearSocial(prisma) {
  await prisma.notification.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.contentLike.deleteMany({});
  await prisma.contentView.deleteMany({});
}

function targetIds(kind, id) {
  return {
    workId: kind === 'work' ? id : null,
    projectId: kind === 'project' ? id : null,
    articleId: kind === 'article' ? id : null,
    dialogueId: kind === 'dialogue' ? id : null,
  };
}

function blockedLike(actor, entity, kind) {
  return (
    actor.email === PLAYWRIGHT_VISITOR_EMAIL &&
    entity.ownerSlug === PLAYWRIGHT_AUTHOR_SLUG &&
    kind === 'work'
  );
}

function seedEntityEngagement(kind, entities, actors) {
  const likeRows = [];
  const viewRows = [];
  const commentRows = [];
  const notificationRows = [];
  const totals = { likes: 0, views: 0, comments: 0 };

  for (const entity of entities) {
    const others = actors.filter(
      (actor) => !entity.ownerUserIds.includes(actor.userId),
    );
    const eligibleLikers = others.filter(
      (actor) => !blockedLike(actor, entity, kind),
    );
    const likers = pickActors(
      `${kind}:${entity.id}:likers`,
      eligibleLikers,
      likeCountFor(entity.id, eligibleLikers.length),
    );
    const commenters = pickActors(
      `${kind}:${entity.id}:commenters`,
      others,
      commentCountFor(entity.id),
    );
    const ids = targetIds(kind, entity.id);

    for (const liker of likers) {
      const createdAt = daysAgo(
        `${kind}:${entity.id}:like:${liker.userId}`,
        18,
      );
      likeRows.push({
        userId: liker.userId,
        targetType: kind,
        targetId: entity.id,
        createdAt,
      });
      for (const ownerId of entity.ownerUserIds) {
        if (ownerId === liker.userId) continue;
        notificationRows.push({
          userId: ownerId,
          kind: `${kind}_liked`,
          actorId: liker.userId,
          profileId: entity.profileId,
          ...ids,
          createdAt,
        });
      }
    }

    for (let index = 0; index < commenters.length; index += 1) {
      const author = commenters[index];
      const createdAt = daysAgo(
        `${kind}:${entity.id}:comment:${author.userId}:${index}`,
        14,
      );
      const commentId = newId();
      commentRows.push({
        id: commentId,
        authorId: author.userId,
        body: commentBody(`${kind}:${entity.id}`, index),
        createdAt,
        ...ids,
      });
      for (const ownerId of entity.ownerUserIds) {
        if (ownerId === author.userId) continue;
        notificationRows.push({
          userId: ownerId,
          kind: `${kind}_commented`,
          actorId: author.userId,
          commentId,
          profileId: entity.profileId,
          ...ids,
          createdAt,
        });
      }
    }

    const viewerKeys = new Set(
      likers.map((liker) => `seed-user:${liker.userId}`),
    );
    let anonIndex = 0;
    const viewsWanted = viewTargetFor(entity.id, likers.length);
    while (viewerKeys.size < viewsWanted && anonIndex < viewsWanted + 40) {
      if (anonIndex < others.length) {
        viewerKeys.add(`seed-user:${others[anonIndex].userId}`);
      } else {
        const key = hash32(`${kind}:${entity.id}:anon:${anonIndex}`).toString(
          16,
        );
        viewerKeys.add(`seed-anon:${key}`);
      }
      anonIndex += 1;
    }

    for (const viewerKey of viewerKeys) {
      const userId = viewerKey.startsWith('seed-user:')
        ? viewerKey.slice('seed-user:'.length)
        : null;
      viewRows.push({
        viewerKey,
        userId,
        targetType: kind,
        targetId: entity.id,
        createdAt: daysAgo(`${kind}:${entity.id}:view:${viewerKey}`, 20),
      });
    }

    totals.likes += likers.length;
    totals.views += viewerKeys.size;
    totals.comments += commenters.length;
  }

  return { likeRows, viewRows, commentRows, notificationRows, totals };
}

function seedFollows(actors) {
  const followRows = [];
  const notificationRows = [];

  for (const follower of actors) {
    const candidates = actors.filter(
      (actor) =>
        actor.userId !== follower.userId &&
        !(
          follower.email === PLAYWRIGHT_VISITOR_EMAIL &&
          actor.slug === PLAYWRIGHT_AUTHOR_SLUG
        ),
    );
    const want = 2 + (hash32(`${follower.userId}:follows`) % 4);
    const picks = pickActors(
      `${follower.userId}:follow-list`,
      candidates,
      want,
    );
    for (const target of picks) {
      const createdAt = daysAgo(
        `follow:${follower.userId}:${target.profileId}`,
        25,
      );
      followRows.push({
        followerId: follower.userId,
        profileId: target.profileId,
        createdAt,
      });
      notificationRows.push({
        userId: target.userId,
        kind: 'profile_followed',
        actorId: follower.userId,
        profileId: target.profileId,
        createdAt,
      });
    }
  }

  return { followRows, notificationRows };
}

/**
 * @param {import('@prisma/client').PrismaClient} [externalPrisma]
 */
async function seedSocialActivity(externalPrisma) {
  ensureDatabaseUrl();
  const { PrismaClient } = require('@prisma/client');
  const prisma = externalPrisma ?? new PrismaClient();
  const ownsClient = !externalPrisma;

  try {
    await clearSocial(prisma);

    const profiles = await prisma.profile.findMany({
      where: {
        publishedAt: { not: null },
        slug: { not: null },
        user: { email: { endsWith: '@nechto.test' } },
      },
      select: {
        id: true,
        userId: true,
        slug: true,
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (profiles.length < 2) {
      console.warn('  social: need at least 2 published seed profiles');
      return;
    }

    const actors = profiles.map((profile) => ({
      userId: profile.userId,
      profileId: profile.id,
      slug: profile.slug,
      email: profile.user.email,
    }));

    const [works, projects, articles, dialogues] = await Promise.all([
      prisma.work.findMany({
        where: { hidden: false, profile: { publishedAt: { not: null } } },
        select: {
          id: true,
          profileId: true,
          profile: { select: { userId: true, slug: true } },
        },
      }),
      prisma.project.findMany({
        where: { hidden: false, profile: { publishedAt: { not: null } } },
        select: {
          id: true,
          profileId: true,
          profile: { select: { userId: true, slug: true } },
        },
      }),
      prisma.article.findMany({
        where: {
          publishedAt: { not: null },
          hidden: false,
          profile: { publishedAt: { not: null } },
        },
        select: {
          id: true,
          profileId: true,
          profile: { select: { userId: true, slug: true } },
        },
      }),
      prisma.dialogue.findMany({
        where: { publishedAt: { not: null }, hidden: false },
        select: {
          id: true,
          createdByUserId: true,
          leftWork: {
            select: {
              profileId: true,
              profile: { select: { userId: true, slug: true } },
            },
          },
          rightWork: {
            select: { profile: { select: { userId: true } } },
          },
        },
      }),
    ]);

    const owned = (row) => ({
      id: row.id,
      profileId: row.profileId,
      ownerUserIds: [row.profile.userId],
      ownerSlug: row.profile.slug,
    });

    const workPayload = seedEntityEngagement('work', works.map(owned), actors);
    const projectPayload = seedEntityEngagement(
      'project',
      projects.map(owned),
      actors,
    );
    const articlePayload = seedEntityEngagement(
      'article',
      articles.map(owned),
      actors,
    );
    const dialoguePayload = seedEntityEngagement(
      'dialogue',
      dialogues.map((dialogue) => ({
        id: dialogue.id,
        profileId: dialogue.leftWork.profileId,
        ownerSlug: dialogue.leftWork.profile.slug,
        ownerUserIds: [
          ...new Set(
            [
              dialogue.leftWork.profile.userId,
              dialogue.rightWork.profile.userId,
              dialogue.createdByUserId,
            ].filter(Boolean),
          ),
        ],
      })),
      actors,
    );

    const follows = seedFollows(actors);
    const notifications = [
      ...workPayload.notificationRows,
      ...projectPayload.notificationRows,
      ...articlePayload.notificationRows,
      ...dialoguePayload.notificationRows,
      ...follows.notificationRows,
    ];

    await createMany(prisma.contentLike, [
      ...workPayload.likeRows,
      ...projectPayload.likeRows,
      ...articlePayload.likeRows,
      ...dialoguePayload.likeRows,
    ]);
    await createMany(prisma.contentView, [
      ...workPayload.viewRows,
      ...projectPayload.viewRows,
      ...articlePayload.viewRows,
      ...dialoguePayload.viewRows,
    ]);
    await createMany(prisma.comment, [
      ...workPayload.commentRows,
      ...projectPayload.commentRows,
      ...articlePayload.commentRows,
      ...dialoguePayload.commentRows,
    ]);
    await createMany(prisma.follow, follows.followRows);
    await createMany(prisma.notification, notifications);

    const line = (label, count, totals) =>
      `  social ${label}: ${count} (likes ${totals.likes}, views ${totals.views}, comments ${totals.comments})`;

    console.log(
      `  social: ${actors.length} artists · follows ${follows.followRows.length} · notifications ${notifications.length}`,
    );
    console.log(line('works', works.length, workPayload.totals));
    console.log(line('projects', projects.length, projectPayload.totals));
    console.log(line('articles', articles.length, articlePayload.totals));
    console.log(line('dialogues', dialogues.length, dialoguePayload.totals));
  } finally {
    if (ownsClient) {
      await prisma.$disconnect();
    }
  }
}

module.exports = { seedSocialActivity };

if (require.main === module) {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed against NODE_ENV=production');
    process.exitCode = 1;
  } else {
    seedSocialActivity()
      .then(() => {
        console.log('Social seed done');
      })
      .catch((error) => {
        console.error(
          error instanceof Error ? error.stack || error.message : error,
        );
        process.exitCode = 1;
      });
  }
}
