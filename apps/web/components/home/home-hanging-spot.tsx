import { getTranslations } from 'next-intl/server';
import { type DemoStillKind } from '@/lib/demo-media';
import { WorkFrame } from '@/components/ui/work-frame';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';
import type { WorkWithAuthor } from '@nechto/api-contract';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type HomeHangingItem = {
  title: string;
  author: string;
  still: DemoStillKind;
};

type HomeHangingSpotProps = {
  works?: WorkWithAuthor[];
};

export async function HomeHangingSpot({ works = [] }: HomeHangingSpotProps) {
  const t = await getTranslations('HomePage');
  const demoItems = t.raw('hangingSpot.items') as HomeHangingItem[];
  const live = works.slice(0, 5);

  return (
    <section aria-label={t('hangingSpot.kicker')} className="py-6">
      <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col text-center">
        <div className="grid grid-cols-5 items-stretch gap-2">
          {live.length > 0
            ? live.map((work) => (
                <Link
                  key={work.id}
                  href={workPath(work.author.slug, work.id)}
                  className="flex min-w-0 flex-col"
                >
                  <WorkFrame
                    src={toUploadSrc(work.imageUrl)}
                    alt={work.title}
                    fit="cover"
                    className="aspect-[3/4] w-full shrink-0"
                  />
                  <p className="mt-1 truncate font-serif text-[11px] leading-tight">
                    {work.title}
                  </p>
                  <p className="mt-0.5 truncate font-serif text-[11px] opacity-70">
                    {work.author.displayName}
                  </p>
                </Link>
              ))
            : demoItems.map((item) => (
                <Link
                  key={item.title}
                  href={DEMO_PROFILE_HREF}
                  className="flex min-w-0 flex-col"
                >
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
                </Link>
              ))}
        </div>
        <Link href="/top-works" className="mt-2 flex flex-col text-center">
          <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-80">
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
      </div>
    </section>
  );
}
