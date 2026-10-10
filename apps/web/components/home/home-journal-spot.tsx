import { WorkFrame } from '@/components/ui/work-frame';
import { HomeSpotRoot } from '@/components/home/home-spot-root';

type HomeJournalSpotProps = {
  kicker: string;
  title: string;
  lede: string;
  cta: string;
  href?: string | null;
  src?: string | null;
};

export function HomeJournalSpot({
  kicker,
  title,
  lede,
  cta,
  href = '/journal',
  src,
}: HomeJournalSpotProps) {
  return (
    <article>
      <HomeSpotRoot
        href={href}
        spot="journal"
        className="flex min-w-0 flex-col"
      >
        <p className="font-sans text-sm tracking-[0.16em] uppercase opacity-80">
          {kicker}
        </p>
        <h2 className="mt-2 font-serif text-2xl leading-tight tracking-wide md:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-sm font-sans text-base leading-relaxed opacity-70">
          {lede}
        </p>
        <WorkFrame
          src={src}
          alt={title}
          fit="cover"
          className="mt-3 h-72 w-full md:h-[30rem]"
        />
        <span className="mt-2 font-sans text-base text-[var(--accent)]">
          {cta}
        </span>
      </HomeSpotRoot>
    </article>
  );
}
