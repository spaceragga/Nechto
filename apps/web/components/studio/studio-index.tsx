import {
  CREATOR_DIRECTIONS,
  type CreatorDirection,
  type WorkWithAuthor,
} from '@nechto/api-contract';
import { CreatorCard } from '@/components/creators/creator-card';
import { MediaTile } from '@/components/ui/media-tile';
import { WorkFrame } from '@/components/ui/work-frame';
import { excerpt } from '@/lib/excerpt';
import type { PublishedCreator } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { studioPath, workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type StudioIndexProps = {
  title: string;
  featuredKicker: string;
  themesLabel: string;
  worksLabel: string;
  empty: string;
  directionLabel: (direction: string) => string;
  featured: PublishedCreator | null;
  creators: PublishedCreator[];
  works: WorkWithAuthor[];
};

function creatorsForTheme(
  creators: PublishedCreator[],
  theme: CreatorDirection,
): PublishedCreator[] {
  return creators.filter((creator) => creator.directions.includes(theme));
}

export function StudioIndex({
  title,
  featuredKicker,
  themesLabel,
  worksLabel,
  empty,
  directionLabel,
  featured,
  creators,
  works,
}: StudioIndexProps) {
  const hasContent = creators.length > 0 || works.length > 0;
  const themeSections = CREATOR_DIRECTIONS.map((theme) => ({
    theme,
    people: creatorsForTheme(creators, theme).filter(
      (creator) => creator.slug !== featured?.slug,
    ),
  })).filter((section) => section.people.length > 0);

  return (
    <main className="flex w-full flex-col gap-12 px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
      </header>

      {!hasContent ? <p className="text-sm opacity-70">{empty}</p> : null}

      {featured ? (
        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <Link
            href={studioPath(featured.slug)}
            className="min-w-0 no-underline"
          >
            <WorkFrame
              src={toUploadSrc(
                featured.studioCoverUrl ?? featured.latestWorks[0]?.imageUrl,
              )}
              alt={
                featured.studioTitle ?? featured.displayName ?? featured.slug
              }
              fit="cover"
              className="aspect-4/5 w-full md:aspect-3/4"
            />
          </Link>
          <div className="max-w-md">
            <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-70">
              {featuredKicker}
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-wide">
              <Link
                href={studioPath(featured.slug)}
                className="text-[var(--accent)] no-underline"
              >
                {featured.studioTitle ?? featured.displayName ?? featured.slug}
              </Link>
            </h2>
            {featured.directions.length > 0 ? (
              <p className="mt-2 font-sans text-sm opacity-70">
                {featured.directions
                  .map((direction) => directionLabel(direction))
                  .join(' · ')}
              </p>
            ) : null}
            {featured.studioDescription || featured.bio ? (
              <p className="mt-4 font-serif text-sm leading-relaxed opacity-80">
                {excerpt(featured.studioDescription || featured.bio || '', 220)}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {themeSections.length > 0 ? (
        <section className="flex flex-col gap-12">
          <h2 className="font-sans text-xl tracking-wide">{themesLabel}</h2>
          {themeSections.map(({ theme, people }) => (
            <div key={theme}>
              <h3 className="mb-6 font-serif text-2xl tracking-wide">
                {directionLabel(theme)}
              </h3>
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
                {people.map((creator) => (
                  <CreatorCard
                    key={`${theme}-${creator.slug}`}
                    href={studioPath(creator.slug)}
                    name={
                      creator.studioTitle ?? creator.displayName ?? creator.slug
                    }
                    directionLabel={directionLabel(theme)}
                    portraitSrc={toUploadSrc(
                      creator.studioCoverUrl ?? creator.avatarUrl,
                    )}
                    works={creator.latestWorks.map((work) => ({
                      src: toUploadSrc(work.imageUrl),
                      alt: work.title,
                    }))}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {works.length > 0 ? (
        <section>
          <h2 className="mb-6 font-sans text-xl tracking-wide">{worksLabel}</h2>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => (
              <MediaTile
                key={work.id}
                href={workPath(work.author.slug, work.id)}
                title={work.title}
                subtitle={work.author.displayName}
                src={toUploadSrc(work.imageUrl)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
