import { type DemoStillKind } from '@/lib/demo-media';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

const TILES: { still: DemoStillKind; className: string }[] = [
  {
    still: 'alley',
    className: 'col-start-1 row-start-1 row-end-3 -rotate-1',
  },
  {
    still: 'brick',
    className: 'col-start-2 row-start-1 row-end-2 translate-y-2 rotate-1',
  },
  {
    still: 'glass',
    className:
      'col-start-1 row-start-3 row-end-5 translate-x-1 -rotate-[0.5deg]',
  },
  {
    still: 'stool',
    className: 'col-start-2 row-start-2 row-end-5 translate-y-1 -rotate-1',
  },
];

type HomeCollectionSpotProps = {
  kicker: string;
  title: string;
  meta: string;
};

export function HomeCollectionSpot({
  kicker,
  title,
  meta,
}: HomeCollectionSpotProps) {
  return (
    <article className="flex h-full min-h-0 min-w-0 flex-col">
      <Link href="/collections" className="flex h-full min-h-0 flex-col">
        <div className="grid min-h-[12.5rem] flex-1 grid-cols-[1.15fr_0.9fr] grid-rows-[1.25fr_0.7fr_1fr_1.2fr] gap-x-5 gap-y-6 overflow-hidden">
          {TILES.map((tile) => (
            <WorkFrame
              key={tile.still}
              still={tile.still}
              fit="cover"
              className={`h-full min-h-0 w-full ${tile.className}`}
            />
          ))}
        </div>
        <p className="mt-2 font-sans text-xs tracking-[0.2em] uppercase opacity-80">
          {kicker}
        </p>
        <h2 className="mt-1 font-serif text-2xl tracking-wide">{title}</h2>
        <p className="mt-1 font-serif text-sm opacity-70">{meta}</p>
      </Link>
    </article>
  );
}
