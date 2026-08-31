import { Link } from '@/i18n/navigation';

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
      <Link
        href="/journal"
        data-home-spot="looking"
        className="flex min-w-0 flex-col"
      >
        <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-80">
          {kicker}
        </p>
        <h2 className="mt-2 font-serif text-3xl leading-tight tracking-wide">
          {title}
        </h2>
        <p className="mt-2 max-w-sm font-serif text-sm leading-relaxed opacity-70">
          {lede}
        </p>
        <span className="mt-3 font-sans text-sm text-[var(--accent)]">
          {cta}
        </span>
      </Link>
    </article>
  );
}
