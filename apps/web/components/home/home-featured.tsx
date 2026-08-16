import type { DemoStillKind } from '@/lib/demo-media';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

type HomeFeaturedProps = {
  href: string;
  still: DemoStillKind;
  kicker: string;
  title: string;
  meta: string;
  cta: string;
};

export function HomeFeatured({
  href,
  still,
  kicker,
  title,
  meta,
  cta,
}: HomeFeaturedProps) {
  return (
    <Link href={href} className="flex min-w-0 flex-col">
      <WorkFrame still={still} alt={title} className="h-40 w-full md:h-52" />
      <p className="mt-3 font-sans text-xs tracking-[0.2em] uppercase opacity-80">
        {kicker}
      </p>
      <p className="mt-1 font-serif text-2xl md:text-3xl">{title}</p>
      <p className="mt-1 font-serif text-sm opacity-70">{meta}</p>
      <span className="mt-3 font-sans text-sm text-[var(--accent)]">{cta}</span>
    </Link>
  );
}
