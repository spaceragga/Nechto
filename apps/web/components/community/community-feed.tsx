import type { WorkWithAuthor } from '@nechto/api-contract';
import { MediaTile } from '@/components/ui/media-tile';
import { WorkFrame } from '@/components/ui/work-frame';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

export type CommunityPerson = {
  href: string;
  name: string;
  lede: string;
  src: string | null;
};

type CommunityFeedProps = {
  title: string;
  lede: string;
  peopleLabel: string;
  wallLabel: string;
  empty: string;
  people: CommunityPerson[];
  works: WorkWithAuthor[];
};

export function CommunityFeed({
  title,
  lede,
  peopleLabel,
  wallLabel,
  empty,
  people,
  works,
}: CommunityFeedProps) {
  const hasContent = people.length > 0 || works.length > 0;

  return (
    <main className="flex w-full flex-col gap-12 px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm opacity-70">{lede}</p>
      </header>
      {!hasContent ? <p className="text-sm opacity-70">{empty}</p> : null}
      {people.length > 0 ? (
        <section>
          <h2 className="mb-4 font-sans text-xl tracking-wide">
            {peopleLabel}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <Link key={person.href} href={person.href} className="min-w-0">
                <WorkFrame
                  src={person.src}
                  alt={person.name}
                  fit="cover"
                  className="aspect-3/4 w-full"
                />
                <p className="mt-2 font-serif text-lg">{person.name}</p>
                {person.lede ? (
                  <p className="mt-1 font-sans text-sm opacity-70">
                    {person.lede}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {works.length > 0 ? (
        <section>
          <h2 className="mb-4 font-sans text-xl tracking-wide">{wallLabel}</h2>
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
