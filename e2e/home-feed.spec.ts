import { expect, test } from '@playwright/test';
import type {
  CreatorDirection,
  Work,
  WorkWithAuthor,
} from '@nechto/api-contract';
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
  directions: CreatorDirection[] = ['photography'],
): WorkWithAuthor {
  return {
    ...item,
    author: {
      slug,
      displayName,
      avatarUrl: null,
      directions,
    },
  };
}

function creator(options: {
  slug: string;
  displayName: string;
  bio: string | null;
  work: Work;
  directions?: CreatorDirection[];
}): PublishedCreator {
  return {
    slug: options.slug,
    displayName: options.displayName,
    bio: options.bio,
    avatarUrl: null,
    directions: options.directions ?? ['photography'],
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

  test('leaves journal empty when no work has a description', () => {
    const silent = work('w-silent', 'Тишина');
    silent.description = '';
    const feed = pickHomeFeed(
      [withAuthor(silent, 'artist-1', 'Кася')],
      [
        creator({
          slug: 'artist-1',
          displayName: 'Кася',
          bio: 'Био.',
          work: silent,
        }),
      ],
    );

    expect(feed.billboard?.id).toBe('w-silent');
    expect(feed.journal).toBeNull();
  });

  test('does not reuse a work across house spots', () => {
    const kasia = work('w-kasia-1', 'Двор');
    const kasia2 = work('w-kasia-2', 'Окно');
    const anna = work('w-anna-1', 'Кухня');
    const anna2 = work('w-anna-2', 'Лампа');
    const yulia = work('w-yulia-1', 'Шов');
    const yulia2 = work('w-yulia-2', 'Ателье');
    const pavel = work('w-pavel-1', 'Макет');
    const pavel2 = work('w-pavel-2', 'Сетка');
    const lena = work('w-lena-1', 'Глазурь');

    const kasiaAuthor = (item: ReturnType<typeof work>) =>
      withAuthor(item, 'kasia', 'Кася');

    const feed = pickHomeFeed(
      [
        kasiaAuthor(kasia),
        kasiaAuthor(kasia2),
        withAuthor(anna, 'anna', 'Анна', ['interior']),
        withAuthor(anna2, 'anna', 'Анна', ['interior']),
        withAuthor(yulia, 'yulia', 'Юлия', ['fashion']),
        withAuthor(yulia2, 'yulia', 'Юлия', ['fashion']),
        withAuthor(pavel, 'pavel', 'Павел'),
        withAuthor(pavel2, 'pavel', 'Павел'),
        withAuthor(lena, 'lena', 'Лена', ['craft']),
      ],
      [
        creator({
          slug: 'kasia',
          displayName: 'Кася',
          bio: 'Плёнка.',
          work: kasia,
        }),
        creator({
          slug: 'anna',
          displayName: 'Анна',
          bio: 'Интерьер.',
          work: anna,
          directions: ['interior'],
        }),
        creator({
          slug: 'yulia',
          displayName: 'Юлия',
          bio: 'Шов.',
          work: yulia,
          directions: ['fashion'],
        }),
        creator({
          slug: 'pavel',
          displayName: 'Павел',
          bio: 'Макет.',
          work: pavel,
        }),
        creator({
          slug: 'lena',
          displayName: 'Лена',
          bio: 'Глина.',
          work: lena,
          directions: ['craft'],
        }),
      ],
    );

    const ids = [
      feed.billboard?.id,
      feed.journal?.work.id,
      ...(feed.dialogue?.map((item) => item.id) ?? []),
      ...feed.collection.map((item) => item.id),
      ...feed.hanging.map((item) => item.id),
      ...feed.fresh.map((item) => item.id),
      feed.openCall?.id,
    ].filter((id): id is string => Boolean(id));

    expect(new Set(ids).size).toBe(ids.length);
    expect(feed.studio?.slug).not.toBe(feed.creatorOfWeek?.slug);
  });
});
