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

function hasWorkCopy(work: Work): boolean {
  return Boolean(work.description?.trim());
}

function uniqueWorks(works: WorkWithAuthor[]): WorkWithAuthor[] {
  const seen = new Set<string>();
  const ordered: WorkWithAuthor[] = [];
  for (const work of works) {
    if (seen.has(work.id)) {
      continue;
    }
    seen.add(work.id);
    ordered.push(work);
  }
  return ordered;
}

function unusedWorks(
  pool: WorkWithAuthor[],
  used: Set<string>,
): WorkWithAuthor[] {
  return pool.filter((work) => !used.has(work.id));
}

function takeUnusedWorks(
  pool: WorkWithAuthor[],
  used: Set<string>,
  count: number,
  predicate?: (work: WorkWithAuthor) => boolean,
): WorkWithAuthor[] {
  const picked: WorkWithAuthor[] = [];
  for (const work of pool) {
    if (used.has(work.id) || (predicate && !predicate(work))) {
      continue;
    }
    used.add(work.id);
    picked.push(work);
    if (picked.length >= count) {
      break;
    }
  }
  return picked;
}

function creatorBySlug(
  creators: PublishedCreator[],
  slug: string,
): PublishedCreator | null {
  return creators.find((creator) => creator.slug === slug) ?? null;
}

export function pickHomeFeed(
  works: WorkWithAuthor[],
  creators: PublishedCreator[],
): HomeFeedSlices {
  const spotlight = featuredCreators(creators);
  const fromFeed = worksByCreators(works, spotlight);
  const fromProfiles = worksFromCreators(spotlight);
  const spotlightWorks = fromFeed.length > 0 ? fromFeed : fromProfiles;
  const rest = uniqueWorks([...spotlightWorks, ...works]);
  const used = new Set<string>();

  const billboard = takeUnusedWorks(spotlightWorks, used, 1)[0] ?? null;
  const creatorOfWeek = spotlight[0] ?? null;
  const nowCreators = spotlight.slice(0, 3);

  const journalWork =
    takeUnusedWorks(spotlightWorks, used, 1, (work) => hasWorkCopy(work))[0] ??
    null;
  const journalCreator = journalWork
    ? creatorBySlug(creators, journalWork.author.slug)
    : null;

  const dialogue = pairFromDifferentAuthors(unusedWorks(rest, used));
  if (dialogue) {
    used.add(dialogue[0].id);
    used.add(dialogue[1].id);
  }

  const collection = pickCollectionWorks(unusedWorks(rest, used));
  for (const work of collection) {
    used.add(work.id);
  }

  const hanging = takeUnusedWorks(
    uniqueWorks([...hangingFromCreators(spotlight), ...rest]),
    used,
    5,
  );
  const fresh = takeUnusedWorks(works.length > 0 ? works : rest, used, 3);
  const openCall = takeUnusedWorks(rest, used, 1)[0] ?? null;

  const studioPool = spotlight.filter(
    (creator) => creator.slug !== creatorOfWeek?.slug,
  );
  const studio = pickStudioCreator(studioPool) ?? pickStudioCreator(spotlight);

  return {
    billboard,
    creatorOfWeek,
    nowCreators,
    railWorks: spotlightWorks,
    fresh,
    hanging,
    journal:
      journalCreator && journalWork
        ? { creator: journalCreator, work: journalWork }
        : null,
    collection,
    dialogue,
    studio,
    openCall,
  };
}
