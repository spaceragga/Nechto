import type { DemoStillKind } from '@/lib/demo-media';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

type HomeFeaturedProps = {
  href: string;
  still?: DemoStillKind;
  src?: string | null;
  kicker: string;
  title: string;
  meta: string;
  cta: string;
  fit?: 'contain' | 'cover';
  stillClassName?: string;
  align?: 'start' | 'center';
  spot?: string;
};

export function HomeFeatured({
  href,
  still,
  src,
  kicker,
  title,
  meta,
  cta,
  fit = 'contain',
  stillClassName = 'h-36 w-full md:h-44',
  align = 'start',
  spot,
}: HomeFeaturedProps) {
  return (
    <Link
      href={href}
      data-home-spot={spot}
      className={
        align === 'center'
          ? 'flex min-w-0 flex-col text-center'
          : 'flex min-w-0 flex-col'
      }
    >
      <WorkFrame
        still={still}
        src={src}
        alt={title}
        fit={fit}
        className={stillClassName}
      />
      <p className="mt-2 font-sans text-xs tracking-[0.2em] uppercase opacity-80">
        {kicker}
      </p>
      <p className="mt-1 font-serif text-2xl md:text-3xl">{title}</p>
      <p className="mt-0.5 font-serif text-sm opacity-70">{meta}</p>
      <span className="mt-2 font-sans text-sm text-[var(--accent)]">{cta}</span>
    </Link>
  );
}
