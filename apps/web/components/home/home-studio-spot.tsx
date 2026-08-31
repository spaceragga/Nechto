import { WorkFrame } from '@/components/ui/work-frame';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';
import { Link } from '@/i18n/navigation';

type HomeStudioSpotProps = {
  kicker: string;
  title: string;
  lede: string;
  cta: string;
  href?: string;
  src?: string | null;
};

export function HomeStudioSpot({
  kicker,
  title,
  lede,
  cta,
  href = DEMO_PROFILE_HREF,
  src,
}: HomeStudioSpotProps) {
  return (
    <article>
      <Link
        href={href}
        data-home-spot="studio"
        className="flex min-w-0 flex-col"
      >
        <WorkFrame
          still={src ? undefined : 'coat'}
          src={src}
          alt={title}
          className="h-40 w-full"
        />
        <p className="mt-2 font-sans text-xs tracking-[0.2em] uppercase opacity-80">
          {kicker}
        </p>
        <h2 className="mt-1 font-serif text-2xl tracking-wide">{title}</h2>
        <p className="mt-1 font-serif text-sm opacity-70">{lede}</p>
        <span className="mt-2 font-sans text-sm text-[var(--accent)]">
          {cta}
        </span>
      </Link>
    </article>
  );
}
