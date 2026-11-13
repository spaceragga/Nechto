import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

type HomeOpenCallSpotProps = {
  kicker: string;
  title: string;
  lede: string;
  cta: string;
  href?: string;
  src?: string | null;
};

export function HomeOpenCallSpot({
  kicker,
  title,
  lede,
  cta,
  href = '/register',
  src,
}: HomeOpenCallSpotProps) {
  return (
    <article className="relative -mx-6">
      <Link href={href} className="block" aria-label={title}>
        <WorkFrame
          src={src}
          alt=""
          fit="cover"
          className="h-48 w-full md:h-64"
        />
      </Link>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/45 px-6 text-center">
        <p className="font-sans text-sm tracking-[0.16em] uppercase opacity-80">
          {kicker}
        </p>
        <h2 className="mt-2 font-serif text-3xl leading-tight tracking-wide md:text-4xl">
          {title}
        </h2>
        <p className="mt-2 max-w-lg font-sans text-base leading-relaxed opacity-90">
          {lede}
        </p>
        <Link
          href={href}
          className="accent-mark pointer-events-auto mt-3 font-sans text-base"
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}
