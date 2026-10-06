import type {
  ArticleSummary,
  CreatorDirection,
  DialogueSummary,
  ProjectSummary,
  WorkWithAuthor,
} from '@nechto/api-contract';
import type { PublishedCreator } from './load-published-feed';

export type HomeDialogue = {
  id: string | null;
  title: string;
  note: string;
  left: WorkWithAuthor;
  right: WorkWithAuthor;
};

function toHomeDialogue(dialogue: DialogueSummary | null): HomeDialogue | null {
  if (!dialogue) {
    return null;
  }
  return {
    id: dialogue.id,
    title: dialogue.title,
    note: dialogue.note,
    left: dialogue.left,
    right: dialogue.right,
  };
}

function autoHomeDialogue(
  pair: [WorkWithAuthor, WorkWithAuthor] | null,
): HomeDialogue | null {
  if (!pair) {
    return null;
  }
  return {
    id: null,
    title: `${pair[0].title} / ${pair[1].title}`,
    note: '',
    left: pair[0],
    right: pair[1],
  };
}

export function pickStudioCreator(
  creators: PublishedCreator[],
): PublishedCreator | null {
  return creators.find((creator) => creator.inStudio) ?? creators[0] ?? null;
}

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

export function pickHomeSeries(
  series: ProjectSummary[],
): ProjectSummary | null {
  return (
    series.find((item) => item.frameImageUrls.length > 0) ?? series[0] ?? null
  );
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
  journal: ArticleSummary | null;
  dialogue: HomeDialogue | null;
  studio: PublishedCreator | null;
  openCall: WorkWithAuthor | null;
  series: ProjectSummary | null;
};

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

export function pickHomeFeed(
  works: WorkWithAuthor[],
  creators: PublishedCreator[],
  series: ProjectSummary[] = [],
  journal: ArticleSummary | null = null,
  curatedDialogue: DialogueSummary | null = null,
  curatedStudio: PublishedCreator | null = null,
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

  const curated = toHomeDialogue(curatedDialogue);
  if (curated) {
    used.add(curated.left.id);
    used.add(curated.right.id);
  }
  const dialogue =
    curated ??
    autoHomeDialogue(pairFromDifferentAuthors(unusedWorks(rest, used)));
  if (dialogue && !curated) {
    used.add(dialogue.left.id);
    used.add(dialogue.right.id);
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
  const studio =
    curatedStudio ??
    pickStudioCreator(studioPool) ??
    pickStudioCreator(spotlight);

  return {
    billboard,
    creatorOfWeek,
    nowCreators,
    railWorks: spotlightWorks,
    fresh,
    hanging,
    journal,
    dialogue,
    series: pickHomeSeries(series),
    studio,
    openCall,
  };
}
