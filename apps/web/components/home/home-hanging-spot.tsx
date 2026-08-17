import { getTranslations } from 'next-intl/server';
import { type DemoStillKind } from '@/lib/demo-media';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

type HomeHangingItem = {
  title: string;
  author: string;
  still: DemoStillKind;
};

export async function HomeHangingSpot() {
  const t = await getTranslations('HomePage');
  const items = t.raw('hangingSpot.items') as HomeHangingItem[];

  return (
    <section aria-label={t('hangingSpot.kicker')} className="py-6">
      <Link
        href="/top-works"
        className="mx-auto flex w-full max-w-5xl min-w-0 flex-col text-center"
      >
        <div className="grid grid-cols-5 items-stretch gap-2">
          {items.map((item) => (
            <div key={item.title} className="flex min-w-0 flex-col">
              <WorkFrame
                still={item.still}
                alt={item.title}
                fit="cover"
                className="aspect-[3/4] w-full shrink-0"
              />
              <p className="mt-1 truncate font-serif text-[11px] leading-tight">
                {item.title}
              </p>
              <p className="mt-0.5 truncate font-serif text-[11px] opacity-70">
                {item.author}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 font-sans text-xs tracking-[0.2em] uppercase opacity-80">
          {t('hangingSpot.kicker')}
        </p>
        <h2 className="mt-1 font-serif text-2xl tracking-wide">
          {t('hangingSpot.title')}
        </h2>
        <p className="mt-1 font-serif text-sm opacity-70">
          {t('hangingSpot.lede')}
        </p>
        <span className="mt-2 font-sans text-sm text-[var(--accent)]">
          {t('hangingSpot.cta')}
        </span>
      </Link>
    </section>
  );
}
