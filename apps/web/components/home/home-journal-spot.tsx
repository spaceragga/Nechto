import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

type HomeJournalSpotProps = {
  kicker: string;
  title: string;
  lede: string;
  cta: string;
};

export function HomeJournalSpot({
  kicker,
  title,
  lede,
  cta,
}: HomeJournalSpotProps) {
  return (
    <article>
      <Link href="/journal" className="flex min-w-0 flex-col">
        <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-80">
          {kicker}
        </p>
        <h2 className="mt-2 font-serif text-3xl leading-tight tracking-wide">
          {title}
        </h2>
        <p className="mt-2 max-w-sm font-sans text-sm leading-relaxed opacity-70">
          {lede}
        </p>
        <WorkFrame
          still="glass"
          alt={title}
          fit="cover"
          className="mt-3 h-72 w-full md:h-[30rem]"
        />
        <span className="mt-2 font-sans text-sm text-[var(--accent)]">
          {cta}
        </span>
      </Link>
    </article>
  );
}
