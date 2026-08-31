import type {
  CreatorDirection,
  Work,
  WorkWithAuthor,
} from '@nechto/api-contract';
import type { PublishedCreator } from './load-published-feed';

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

export function worksFromCreators(
  creators: PublishedCreator[],
  limit?: number,
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
    if (limit !== undefined && works.length >= limit) {
      break;
    }
  }

  return works;
}

export function hangingFromCreators(
  creators: PublishedCreator[],
): WorkWithAuthor[] {
  return worksFromCreators(creators, 5);
}

export function latestWorkOf(creator: PublishedCreator): Work | null {
  return creator.latestWorks[0] ?? null;
}

function hasProfileCopy(creator: PublishedCreator): boolean {
  return Boolean(creator.bio?.trim());
}

/** Prefer profiles with a bio so incomplete publishes do not take over the house. */
export function featuredCreators(
  creators: PublishedCreator[],
): PublishedCreator[] {
  const withCopy = creators.filter(hasProfileCopy);
  return withCopy.length > 0 ? withCopy : creators;
}

export function worksByCreators(
  works: WorkWithAuthor[],
  creators: PublishedCreator[],
): WorkWithAuthor[] {
  const slugs = new Set(creators.map((creator) => creator.slug));
  if (slugs.size === 0) {
    return works;
  }
  return works.filter((work) => slugs.has(work.author.slug));
}

export type HomeFeedSlices = {
  billboard: WorkWithAuthor | null;
  creatorOfWeek: PublishedCreator | null;
  nowCreators: PublishedCreator[];
  railWorks: WorkWithAuthor[];
  fresh: WorkWithAuthor[];
  hanging: WorkWithAuthor[];
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
  const spotlight = featuredCreators(creators);
  const fromFeed = worksByCreators(works, spotlight);
  const fromProfiles = worksFromCreators(spotlight);
  const spotlightWorks = fromFeed.length > 0 ? fromFeed : fromProfiles;
  const hanging = hangingFromCreators(spotlight);
  const journalCreator =
    spotlight.find(
      (creator) => hasProfileCopy(creator) && creator.latestWorks[0],
    ) ??
    spotlight.find((creator) => creator.latestWorks[0]) ??
    null;
  const journalWork = journalCreator ? latestWorkOf(journalCreator) : null;

  return {
    billboard: spotlightWorks[0] ?? null,
    creatorOfWeek: spotlight[0] ?? null,
    nowCreators: spotlight.slice(0, 3),
    railWorks: spotlightWorks,
    fresh: spotlightWorks.slice(0, 3),
    hanging,
    journal:
      journalCreator && journalWork
        ? { creator: journalCreator, work: journalWork }
        : null,
    collection: pickCollectionWorks(spotlightWorks),
    dialogue: pairFromDifferentAuthors(spotlightWorks),
    studio: pickStudioCreator(spotlight),
    openCall: spotlightWorks[1] ?? spotlightWorks[0] ?? null,
  };
}
