import { expect, test } from '@playwright/test';
import type { Work, WorkWithAuthor } from '@nechto/api-contract';
import type { PublishedCreator } from '../apps/web/lib/load-published-feed';
import { pickHomeFeed } from '../apps/web/lib/pick-home-feed';

function work(id: string, title: string): Work {
  return {
    id,
    title,
    description: title,
    imageUrl: `/uploads/${id}.jpg`,
    createdAt: '2026-08-31T00:00:00.000Z',
  };
}

function withAuthor(
  item: Work,
  slug: string,
  displayName: string,
): WorkWithAuthor {
  return {
    ...item,
    author: {
      slug,
      displayName,
      avatarUrl: null,
      directions: ['photography'],
    },
  };
}

function creator(options: {
  slug: string;
  displayName: string;
  bio: string | null;
  work: Work;
}): PublishedCreator {
  return {
    slug: options.slug,
    displayName: options.displayName,
    bio: options.bio,
    avatarUrl: null,
    directions: ['photography'],
    websiteUrl: null,
    instagramUrl: null,
    telegramUrl: null,
    publishedAt: '2026-08-31T00:00:00.000Z',
    workCount: 1,
    latestWorks: [options.work],
  };
}

test.describe('home feed pick', () => {
  test('keeps fixture publishes off the billboard when complete profiles exist', () => {
    const fixtureWork = work('w-fixture', 'Работа 5');
    const seedWork = work('w-seed', 'Двор');
    const feed = pickHomeFeed(
      [withAuthor(fixtureWork, 'artist-1', 'Кася Тест')],
      [
        creator({
          slug: 'artist-1',
          displayName: 'Кася Тест',
          bio: null,
          work: fixtureWork,
        }),
        creator({
          slug: 'taras-litvin',
          displayName: 'Тарас Літвін',
          bio: 'Плёнка и двор.',
          work: seedWork,
        }),
      ],
    );

    expect(feed.billboard?.title).toBe('Двор');
    expect(feed.creatorOfWeek?.slug).toBe('taras-litvin');
    expect(feed.nowCreators.map((item) => item.slug)).toEqual(['taras-litvin']);
    expect(feed.railWorks.map((item) => item.title)).toEqual(['Двор']);
  });

  test('falls back to any published creator when nobody has a bio', () => {
    const fixtureWork = work('w-fixture', 'Работа 5');
    const feed = pickHomeFeed(
      [withAuthor(fixtureWork, 'artist-1', 'Кася Тест')],
      [
        creator({
          slug: 'artist-1',
          displayName: 'Кася Тест',
          bio: null,
          work: fixtureWork,
        }),
      ],
    );

    expect(feed.billboard?.title).toBe('Работа 5');
    expect(feed.creatorOfWeek?.slug).toBe('artist-1');
  });
});
