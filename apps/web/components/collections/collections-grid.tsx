import { MediaTile } from '@/components/ui/media-tile';
import type { DemoStillKind } from '@/lib/demo-media';

export type CollectionChannel = {
  href: string;
  title: string;
  meta: string;
  still?: DemoStillKind;
  src?: string | null;
};

type CollectionsGridProps = {
  title: string;
  lede: string;
  empty?: string;
  channels: CollectionChannel[];
};

export function CollectionsGrid({
  title,
  lede,
  empty,
  channels,
}: CollectionsGridProps) {
  return (
    <main className="flex w-full flex-col gap-10 px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm opacity-70">{lede}</p>
      </header>
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
              still={channel.still}
              src={channel.src}
              wellClassName="aspect-square w-full"
            />
          ))}
        </div>
      )}
    </main>
  );
}
