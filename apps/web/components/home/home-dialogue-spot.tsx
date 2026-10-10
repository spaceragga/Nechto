import { WorkFrame } from '@/components/ui/work-frame';
import { HomeSpotRoot } from '@/components/home/home-spot-root';

type HomeDialogueSpotProps = {
  kicker: string;
  title: string;
  lede: string;
  leftTitle: string;
  leftMeta: string;
  rightTitle: string;
  rightMeta: string;
  cta: string;
  href?: string | null;
  leftSrc?: string | null;
  rightSrc?: string | null;
};

export function HomeDialogueSpot({
  kicker,
  title,
  lede,
  leftTitle,
  leftMeta,
  rightTitle,
  rightMeta,
  cta,
  href = '/dialogue',
  leftSrc,
  rightSrc,
}: HomeDialogueSpotProps) {
  return (
    <article>
      <HomeSpotRoot
        href={href}
        spot="dialogue"
        className="flex min-w-0 flex-col"
      >
        <div className="grid grid-cols-2 gap-1">
          <div className="min-w-0">
            <WorkFrame
              src={leftSrc}
              alt={leftTitle}
              fit="cover"
              className="h-64 w-full"
            />
            <p className="mt-2 truncate text-center font-serif text-base">
              {leftTitle}
            </p>
            <p className="mt-0.5 text-center font-serif text-sm opacity-70">
              {leftMeta}
            </p>
          </div>
          <div className="min-w-0">
            <WorkFrame
              src={rightSrc}
              alt={rightTitle}
              fit="cover"
              className="h-64 w-full"
            />
            <p className="mt-2 truncate text-center font-serif text-base">
              {rightTitle}
            </p>
            <p className="mt-0.5 text-center font-serif text-sm opacity-70">
              {rightMeta}
            </p>
          </div>
        </div>
        <p className="mt-3 font-sans text-sm tracking-[0.16em] uppercase opacity-80">
          {kicker}
        </p>
        <h2 className="mt-1 font-serif text-2xl leading-tight tracking-wide md:text-3xl">
          {title}
        </h2>
        <p className="mt-1 font-sans text-base leading-relaxed opacity-70">
          {lede}
        </p>
        <span className="mt-2 font-sans text-base text-[var(--accent)]">
          {cta}
        </span>
      </HomeSpotRoot>
    </article>
  );
}
