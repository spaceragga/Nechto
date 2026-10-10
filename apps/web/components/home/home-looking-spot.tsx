import { HomeSpotRoot } from '@/components/home/home-spot-root';

type HomeLookingSpotProps = {
  kicker: string;
  title: string;
  lede: string;
  cta: string;
};

export function HomeLookingSpot({
  kicker,
  title,
  lede,
  cta,
}: HomeLookingSpotProps) {
  return (
    <article>
      <HomeSpotRoot
        href="/looking"
        spot="looking"
        className="flex min-w-0 flex-col"
      >
        <p className="font-sans text-sm tracking-[0.16em] uppercase opacity-80">
          {kicker}
        </p>
        <h2 className="mt-2 font-serif text-2xl leading-tight tracking-wide md:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-sm font-sans text-base leading-relaxed opacity-70">
          {lede}
        </p>
        <span className="mt-3 font-sans text-base text-[var(--accent)]">
          {cta}
        </span>
      </HomeSpotRoot>
    </article>
  );
}
