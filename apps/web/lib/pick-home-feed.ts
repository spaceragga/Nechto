import type {
  CreatorDirection,
  Work,
  WorkWithAuthor,
} from '@nechto/api-contract';
import type { PublishedCreator } from '@/lib/load-published-feed';

const STUDIO_DIRECTIONS: CreatorDirection[] = ['craft', 'interior', 'fashion'];

export function latestWorkPerAuthor(works: WorkWithAuthor[]): WorkWithAuthor[] {
  const seen = new Set<string>();
  const picked: WorkWithAuthor[] = [];

  for (const work of works) {
    if (seen.has(work.author.slug)) {
      continue;
    }
    seen.add(work.author.slug);
    picked.push(work);
  }

  return picked;
}

export function worksByDirection(
  works: WorkWithAuthor[],
): Map<CreatorDirection, WorkWithAuthor[]> {
  const grouped = new Map<CreatorDirection, WorkWithAuthor[]>();

  for (const work of works) {
    for (const direction of work.author.directions) {
      const list = grouped.get(direction) ?? [];
      list.push(work);
      grouped.set(direction, list);
    }
  }

  return grouped;
}

export function pairFromDifferentAuthors(
  works: WorkWithAuthor[],
): [WorkWithAuthor, WorkWithAuthor] | null {
  const first = works[0];
  if (!first) {
    return null;
  }

  const second = works.find((work) => work.author.slug !== first.author.slug);
  if (!second) {
    return null;
  }

  return [first, second];
}

export function pickStudioCreator(
  creators: PublishedCreator[],
): PublishedCreator | null {
  return (
    creators.find((creator) =>
      creator.directions.some((direction) =>
        STUDIO_DIRECTIONS.includes(direction),
      ),
    ) ??
    creators[0] ??
    null
  );
}

export function pickCollectionWorks(
  works: WorkWithAuthor[],
  preferred: CreatorDirection = 'photography',
): WorkWithAuthor[] {
  const inDirection = works.filter((work) =>
    work.author.directions.includes(preferred),
  );
  const pool = inDirection.length >= 4 ? inDirection : works;
  return pool.slice(0, 4);
}

export function hangingFromCreators(
  creators: PublishedCreator[],
): WorkWithAuthor[] {
  const works: WorkWithAuthor[] = [];

  for (const creator of creators) {
    const work = creator.latestWorks[0];
    if (!work) {
      continue;
    }
    works.push({
      ...work,
      author: {
        slug: creator.slug,
        displayName: creator.displayName ?? creator.slug,
        avatarUrl: creator.avatarUrl,
        directions: creator.directions,
      },
    });
    if (works.length === 5) {
      break;
    }
  }

  return works;
}

export function latestWorkOf(creator: PublishedCreator): Work | null {
  return creator.latestWorks[0] ?? null;
}

export type HomeFeedSlices = {
  billboard: WorkWithAuthor | null;
  creatorOfWeek: PublishedCreator | null;
  fresh: WorkWithAuthor[];
  hanging: WorkWithAuthor[];
  fragments: WorkWithAuthor[];
  journal: { creator: PublishedCreator; work: Work } | null;
  collection: WorkWithAuthor[];
  dialogue: [WorkWithAuthor, WorkWithAuthor] | null;
  studio: PublishedCreator | null;
  openCall: WorkWithAuthor | null;
};

export function pickHomeFeed(
  works: WorkWithAuthor[],
  creators: PublishedCreator[],
): HomeFeedSlices {
  const hanging = hangingFromCreators(creators);
  const journalCreator =
    creators.find((creator) => creator.bio && creator.latestWorks[0]) ??
    creators.find((creator) => creator.latestWorks[0]) ??
    null;
  const journalWork = journalCreator ? latestWorkOf(journalCreator) : null;

  return {
    billboard: works[0] ?? null,
    creatorOfWeek: creators[0] ?? null,
    fresh: works.slice(0, 3),
    hanging,
    fragments: works.slice(3, 11),
    journal:
      journalCreator && journalWork
        ? { creator: journalCreator, work: journalWork }
        : null,
    collection: pickCollectionWorks(works),
    dialogue: pairFromDifferentAuthors(works),
    studio: pickStudioCreator(creators),
    openCall: works[1] ?? works[0] ?? null,
  };
}
