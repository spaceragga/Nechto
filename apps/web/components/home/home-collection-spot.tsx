import { HomeSpotRoot } from '@/components/home/home-spot-root';
import { WorkFrame } from '@/components/ui/work-frame';

const TILES: { id: string; className: string }[] = [
  {
    id: 'a',
    className: 'col-start-1 row-start-1 row-end-3 -rotate-1',
  },
  {
    id: 'b',
    className: 'col-start-2 row-start-1 row-end-2 translate-y-2 rotate-1',
  },
  {
    id: 'c',
    className:
      'col-start-1 row-start-3 row-end-5 translate-x-1 -rotate-[0.5deg]',
  },
  {
    id: 'd',
    className: 'col-start-2 row-start-2 row-end-5 translate-y-1 -rotate-1',
  },
];

type HomeCollectionSpotProps = {
  kicker: string;
  title: string;
  meta: string;
  href?: string | null;
  srcs?: Array<string | null>;
  className?: string;
};

export function HomeCollectionSpot({
  kicker,
  title,
  meta,
  href = '/collections',
  srcs,
  className = '',
}: HomeCollectionSpotProps) {
  return (
    <article className={`flex min-w-0 flex-col ${className}`.trim()}>
      <HomeSpotRoot
        href={href}
        spot="collection"
        className="flex min-w-0 flex-col"
      >
        <div className="grid h-[22rem] grid-cols-[1.15fr_0.9fr] grid-rows-[1.25fr_0.7fr_1fr_1.2fr] gap-x-5 gap-y-6 overflow-hidden md:h-[26rem]">
          {TILES.map((tile, index) => (
            <WorkFrame
              key={tile.id}
              src={srcs?.[index]}
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
      </HomeSpotRoot>
    </article>
  );
}
