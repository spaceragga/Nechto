import { HomeCta, HomeKicker } from '@/components/home/home-credits';
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
      <HomeSpotRoot spot="looking" className="flex min-w-0 flex-col">
        <HomeKicker href="/looking">{kicker}</HomeKicker>
        <h2 className="mt-2 font-serif text-2xl leading-tight tracking-wide md:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-sm font-sans text-base leading-relaxed opacity-70">
          {lede}
        </p>
        <HomeCta href="/looking" className="mt-3">
          {cta}
        </HomeCta>
      </HomeSpotRoot>
    </article>
  );
}
