import {
  HomeCredits,
  HomeCta,
  HomeKicker,
  type HomeCredit,
} from '@/components/home/home-credits';
import { HomeSpotRoot, HomeStill } from '@/components/home/home-spot-root';
import { WorkFrame } from '@/components/ui/work-frame';

type HomeStudioSpotProps = {
  kicker: string;
  roomHref?: string;
  title: string;
  lede: string;
  cta: string;
  href?: string | null;
  src?: string | null;
  credits?: HomeCredit[];
};

export function HomeStudioSpot({
  kicker,
  roomHref = '/studio',
  title,
  lede,
  cta,
  href,
  src,
  credits = [],
}: HomeStudioSpotProps) {
  return (
    <article>
      <HomeSpotRoot spot="studio" className="flex min-w-0 flex-col">
        <HomeStill href={href}>
          <WorkFrame
            src={src}
            alt={title}
            fit="cover"
            className="h-72 w-full md:h-[28rem]"
          />
        </HomeStill>
        <HomeKicker href={roomHref} className="mt-3">
          {kicker}
        </HomeKicker>
        <h2 className="mt-1 font-serif text-2xl leading-tight tracking-wide md:text-3xl">
          {title}
        </h2>
        {credits.length > 0 ? (
          <p className="mt-1">
            <HomeCredits credits={credits} className="font-serif text-base" />
          </p>
        ) : null}
        <p className="mt-1 font-sans text-base leading-relaxed opacity-70">
          {lede}
        </p>
        <HomeCta href={href ?? roomHref}>{cta}</HomeCta>
      </HomeSpotRoot>
    </article>
  );
}
