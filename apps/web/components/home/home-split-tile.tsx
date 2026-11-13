import { HomeCredits, type HomeCredit } from '@/components/home/home-credits';
import { HomeStill } from '@/components/home/home-spot-root';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

type HomeSplitTileProps = {
  imageHref: string;
  alt: string;
  src?: string | null;
  fit?: 'contain' | 'cover';
  frameClassName?: string;
  title: string;
  titleHref?: string | null;
  credits?: HomeCredit[];
};

export function HomeSplitTile({
  imageHref,
  alt,
  src,
  fit = 'cover',
  frameClassName = 'h-44 w-full',
  title,
  titleHref,
  credits = [],
}: HomeSplitTileProps) {
  return (
    <div className="min-w-0">
      <HomeStill href={imageHref}>
        <WorkFrame src={src} alt={alt} fit={fit} className={frameClassName} />
      </HomeStill>
      <p className="truncate pt-2 font-serif text-base leading-snug">
        {titleHref ? (
          <Link href={titleHref} className="home-credit">
            {title}
          </Link>
        ) : (
          title
        )}
      </p>
      {credits.length > 0 ? (
        <p className="mt-0.5 truncate">
          <HomeCredits credits={credits} className="font-sans text-sm" />
        </p>
      ) : null}
    </div>
  );
}
