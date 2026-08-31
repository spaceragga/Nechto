import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

type HomeOpenCallSpotProps = {
  kicker: string;
  title: string;
  lede: string;
  cta: string;
};

export function HomeOpenCallSpot({
  kicker,
  title,
  lede,
  cta,
}: HomeOpenCallSpotProps) {
  return (
    <article className="-mx-6">
      <Link href="/register" className="relative block overflow-hidden">
        <WorkFrame
          still="paper"
          alt={title}
          fit="cover"
          className="h-48 w-full md:h-64"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 px-6 text-center">
          <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-80">
            {kicker}
          </p>
          <h2 className="mt-2 font-serif text-3xl leading-tight tracking-wide md:text-4xl">
            {title}
          </h2>
          <p className="mt-2 max-w-lg font-sans text-sm leading-relaxed opacity-90">
            {lede}
          </p>
          <span className="mt-3 font-sans text-sm text-[var(--accent)]">
            {cta}
          </span>
        </div>
      </Link>
    </article>
  );
}
