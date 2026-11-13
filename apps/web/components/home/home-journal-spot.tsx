import {
  HomeCredits,
  HomeCta,
  HomeKicker,
  type HomeCredit,
} from '@/components/home/home-credits';
import { HomeSpotRoot, HomeStill } from '@/components/home/home-spot-root';
import { WorkFrame } from '@/components/ui/work-frame';

type HomeJournalSpotProps = {
  kicker: string;
  roomHref?: string;
  title: string;
  lede: string;
  cta: string;
  imageHref?: string | null;
  ctaHref?: string | null;
  src?: string | null;
  credits?: HomeCredit[];
};

export function HomeJournalSpot({
  kicker,
  roomHref = '/journal',
  title,
  lede,
  cta,
  imageHref,
  ctaHref,
  src,
  credits = [],
}: HomeJournalSpotProps) {
  return (
    <article>
      <HomeSpotRoot spot="journal" className="flex min-w-0 flex-col">
        <HomeKicker href={roomHref}>{kicker}</HomeKicker>
        <h2 className="mt-2 font-serif text-2xl leading-tight tracking-wide md:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-sm font-sans text-base leading-relaxed opacity-70">
          {lede}
        </p>
        {credits.length > 0 ? (
          <p className="mt-2">
            <HomeCredits credits={credits} className="font-serif text-base" />
          </p>
        ) : null}
        <HomeStill href={imageHref} className="mt-3">
          <WorkFrame
            src={src}
            alt={title}
            fit="cover"
            className="h-72 w-full md:h-[30rem]"
          />
        </HomeStill>
        <HomeCta href={ctaHref ?? imageHref ?? roomHref}>{cta}</HomeCta>
      </HomeSpotRoot>
    </article>
  );
}
