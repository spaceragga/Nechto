import { MediaTile } from '@/components/ui/media-tile';

export type CollectionChannel = {
  href: string;
  title: string;
  meta: string;
  src?: string | null;
};

type CollectionsGridProps = {
  title: string;
  lede: string;
  seriesHeading: string;
  directionsHeading: string;
  emptySeries: string;
  empty?: string;
  series: CollectionChannel[];
  channels: CollectionChannel[];
};

export function CollectionsGrid({
  title,
  lede,
  seriesHeading,
  directionsHeading,
  emptySeries,
  empty,
  series,
  channels,
}: CollectionsGridProps) {
  return (
    <main className="flex w-full flex-col gap-10 px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm opacity-70">{lede}</p>
      </header>
      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl tracking-wide">{seriesHeading}</h2>
        {series.length === 0 ? (
          <p className="text-sm opacity-70">{emptySeries}</p>
        ) : (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            {series.map((channel) => (
              <MediaTile
                key={channel.href}
                href={channel.href}
                title={channel.title}
                subtitle={channel.meta}
                src={channel.src}
                wellClassName="aspect-square w-full"
              />
            ))}
          </div>
        )}
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl tracking-wide">
          {directionsHeading}
        </h2>
        {channels.length === 0 ? (
          empty ? (
            <p className="text-sm opacity-70">{empty}</p>
          ) : null
        ) : (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            {channels.map((channel) => (
              <MediaTile
                key={channel.href}
                href={channel.href}
                title={channel.title}
                subtitle={channel.meta}
                src={channel.src}
                wellClassName="aspect-square w-full"
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
