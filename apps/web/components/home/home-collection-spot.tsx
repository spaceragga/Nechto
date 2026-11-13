import {
  HomeCredits,
  HomeCta,
  HomeKicker,
  type HomeCredit,
} from '@/components/home/home-credits';
import { HomeSpotRoot, HomeStill } from '@/components/home/home-spot-root';
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
  roomHref?: string;
  title: string;
  meta?: string;
  countLabel?: string;
  cta: string;
  href?: string | null;
  srcs?: Array<string | null>;
  credits?: HomeCredit[];
  className?: string;
};

export function HomeCollectionSpot({
  kicker,
  roomHref = '/collections',
  title,
  meta,
  countLabel,
  cta,
  href = '/collections',
  srcs,
  credits = [],
  className = '',
}: HomeCollectionSpotProps) {
  return (
    <article className={`flex min-w-0 flex-col ${className}`.trim()}>
      <HomeSpotRoot spot="collection" className="flex min-w-0 flex-col">
        <HomeStill href={href}>
          <div className="grid h-[22rem] grid-cols-[1.15fr_0.9fr] grid-rows-[1.25fr_0.7fr_1fr_1.2fr] gap-x-5 gap-y-6 overflow-hidden md:h-[26rem]">
            {TILES.map((tile, index) => (
              <WorkFrame
                key={tile.id}
                src={srcs?.[index]}
                alt=""
                fit="cover"
                className={`h-full min-h-0 w-full ${tile.className}`}
              />
            ))}
          </div>
        </HomeStill>
        <HomeKicker href={roomHref} className="mt-3">
          {kicker}
        </HomeKicker>
        <h2 className="mt-1 font-serif text-2xl leading-tight tracking-wide md:text-3xl">
          {title}
        </h2>
        {credits.length > 0 ? (
          <p className="mt-1 font-serif text-base">
            <HomeCredits credits={credits} className="font-serif text-base" />
            {countLabel ? (
              <span className="opacity-70"> · {countLabel}</span>
            ) : null}
          </p>
        ) : meta ? (
          <p className="mt-1 font-serif text-base opacity-70">{meta}</p>
        ) : null}
        <HomeCta href={href}>{cta}</HomeCta>
      </HomeSpotRoot>
    </article>
  );
}
