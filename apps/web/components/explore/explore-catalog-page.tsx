import { DirectionChips } from '@/components/direction-chips';
import type { DirectionChipPath } from '@/components/direction-chips';
import { MediaTile } from '@/components/ui/media-tile';
import { Link } from '@/i18n/navigation';

export type ExploreCatalogItem = {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  src?: string | null;
};

type ExploreCatalogPageProps = {
  title: string;
  lede: string;
  empty: string;
  more?: string;
  nextHref?: string | null;
  direction?: string;
  filterPath?: DirectionChipPath;
  items: ExploreCatalogItem[];
};

export function ExploreCatalogPage({
  title,
  lede,
  empty,
  more,
  nextHref,
  direction,
  filterPath,
  items,
}: ExploreCatalogPageProps) {
  return (
    <main className="flex w-full flex-col gap-10 px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm opacity-70">{lede}</p>
        {filterPath ? (
          <div className="mt-6">
            <DirectionChips active={direction} basePath={filterPath} />
          </div>
        ) : null}
      </header>
      {items.length === 0 ? (
        <p className="text-sm opacity-70">{empty}</p>
      ) : (
        <section className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MediaTile
              key={item.id}
              href={item.href}
              title={item.title}
              subtitle={item.subtitle}
              src={item.src}
            />
          ))}
        </section>
      )}
      {nextHref && more ? (
        <Link href={nextHref} className="font-sans text-sm">
          {more}
        </Link>
      ) : null}
    </main>
  );
}
