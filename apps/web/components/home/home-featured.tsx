import { WorkFrame } from '@/components/ui/work-frame';
import { HomeSpotRoot } from '@/components/home/home-spot-root';

type HomeFeaturedProps = {
  href?: string | null;
  src?: string | null;
  kicker: string;
  title: string;
  meta: string;
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
  meta,
  cta,
  fit = 'contain',
  frameClassName = 'h-36 w-full md:h-44',
  align = 'start',
  spot,
}: HomeFeaturedProps) {
  return (
    <HomeSpotRoot
      href={href}
      spot={spot}
      className={
        align === 'center'
          ? 'flex min-w-0 flex-col text-center'
          : 'flex min-w-0 flex-col'
      }
    >
      <WorkFrame src={src} alt={title} fit={fit} className={frameClassName} />
      <p className="mt-2 font-sans text-xs tracking-[0.2em] uppercase opacity-80">
        {kicker}
      </p>
      <p className="mt-1 font-serif text-2xl md:text-3xl">{title}</p>
      <p className="mt-0.5 font-serif text-sm opacity-70">{meta}</p>
      <span className="mt-2 font-sans text-sm text-[var(--accent)]">{cta}</span>
    </HomeSpotRoot>
  );
}
