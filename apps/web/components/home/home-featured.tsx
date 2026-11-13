import {
  HomeCredits,
  HomeCta,
  type HomeCredit,
} from '@/components/home/home-credits';
import { HomeSpotRoot, HomeStill } from '@/components/home/home-spot-root';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

type HomeFeaturedProps = {
  href?: string | null;
  src?: string | null;
  kicker: string;
  title: string;
  /** When the title is the author, this opens their page. */
  titleHref?: string | null;
  meta?: string;
  credits?: HomeCredit[];
  cta: string;
  fit?: 'contain' | 'cover';
  frameClassName?: string;
  align?: 'start' | 'center';
  spot?: string;
};

export function HomeFeatured({
  href,
  src,
  kicker,
  title,
  titleHref,
  meta,
  credits = [],
  cta,
  fit = 'contain',
  frameClassName = 'h-36 w-full md:h-44',
  align = 'start',
  spot,
}: HomeFeaturedProps) {
  const centered = align === 'center';

  return (
    <HomeSpotRoot
      spot={spot}
      className={
        centered ? 'flex min-w-0 flex-col text-center' : 'flex min-w-0 flex-col'
      }
    >
      <HomeStill href={href}>
        <WorkFrame src={src} alt={title} fit={fit} className={frameClassName} />
      </HomeStill>
      <p className="mt-4 font-sans text-sm tracking-[0.16em] uppercase opacity-60">
        {kicker}
      </p>
      <p className="mt-1 font-serif text-2xl leading-tight tracking-wide md:text-3xl">
        {titleHref ? (
          <Link href={titleHref} className="home-title-link">
            {title}
          </Link>
        ) : (
          title
        )}
      </p>
      {credits.length > 0 ? (
        <p className={`mt-1 ${centered ? 'flex justify-center' : ''}`}>
          <HomeCredits credits={credits} className="font-serif text-base" />
        </p>
      ) : meta ? (
        <p className="mt-1 font-serif text-base opacity-70">{meta}</p>
      ) : null}
      <HomeCta href={href}>{cta}</HomeCta>
    </HomeSpotRoot>
  );
}
