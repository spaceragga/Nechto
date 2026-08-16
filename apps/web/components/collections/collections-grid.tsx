import { MediaTile } from '@/components/ui/media-tile';
import type { DemoStillKind } from '@/components/ui/demo-still';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';

export type CollectionChannel = {
  title: string;
  meta: string;
  still: DemoStillKind;
};

type CollectionsGridProps = {
  title: string;
  lede: string;
  channels: CollectionChannel[];
};

export function CollectionsGrid({
  title,
  lede,
  channels,
}: CollectionsGridProps) {
  return (
    <main className="flex w-full flex-col gap-10 px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm opacity-70">{lede}</p>
      </header>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
        {channels.map((channel) => (
          <MediaTile
            key={channel.title}
            href={DEMO_PROFILE_HREF}
            title={channel.title}
            subtitle={channel.meta}
            still={channel.still}
            ratio="1/1"
            wellClassName="aspect-square w-full"
          />
        ))}
      </div>
    </main>
  );
}
