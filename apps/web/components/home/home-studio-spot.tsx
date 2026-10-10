import { WorkFrame } from '@/components/ui/work-frame';
import { HomeSpotRoot } from '@/components/home/home-spot-root';

type HomeStudioSpotProps = {
  kicker: string;
  title: string;
  lede: string;
  cta: string;
  href?: string | null;
  src?: string | null;
};

export function HomeStudioSpot({
  kicker,
  title,
  lede,
  cta,
  href,
  src,
}: HomeStudioSpotProps) {
  return (
    <article>
      <HomeSpotRoot href={href} spot="studio" className="flex min-w-0 flex-col">
        <WorkFrame
          src={src}
          alt={title}
          fit="cover"
          className="h-72 w-full md:h-[28rem]"
        />
        <p className="mt-2 font-sans text-sm tracking-[0.16em] uppercase opacity-80">
          {kicker}
        </p>
        <h2 className="mt-1 font-serif text-2xl leading-tight tracking-wide md:text-3xl">
          {title}
        </h2>
        <p className="mt-1 font-sans text-base leading-relaxed opacity-70">
          {lede}
        </p>
        <span className="mt-2 font-sans text-base text-[var(--accent)]">
          {cta}
        </span>
      </HomeSpotRoot>
    </article>
  );
}
