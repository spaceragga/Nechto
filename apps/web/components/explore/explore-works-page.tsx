import type { WorkWithAuthor } from '@nechto/api-contract';
import { MediaTile } from '@/components/ui/media-tile';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type ExploreWorksPageProps = {
  title: string;
  lede: string;
  empty: string;
  more?: string;
  nextHref?: string | null;
  works: WorkWithAuthor[];
};

export function ExploreWorksPage({
  title,
  lede,
  empty,
  more,
  nextHref,
  works,
}: ExploreWorksPageProps) {
  return (
    <main className="flex w-full flex-col gap-10 px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm opacity-70">{lede}</p>
      </header>
      {works.length === 0 ? (
        <p className="text-sm opacity-70">{empty}</p>
      ) : (
        <section className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => (
            <MediaTile
              key={work.id}
              href={workPath(work.author.slug, work.id)}
              title={work.title}
              subtitle={work.author.displayName}
              src={toUploadSrc(work.imageUrl)}
            />
          ))}
        </section>
      )}
      {nextHref && more ? (
        <Link href={nextHref} className="font-sans text-sm underline">
          {more}
        </Link>
      ) : null}
    </main>
  );
}
