import { getTranslations } from 'next-intl/server';
import { WorkFrame } from '@/components/ui/work-frame';
import type { WorkWithAuthor } from '@nechto/api-contract';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type HomeHangingSpotProps = {
  works?: WorkWithAuthor[];
};

export async function HomeHangingSpot({ works = [] }: HomeHangingSpotProps) {
  const t = await getTranslations('HomePage');
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
            : Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex min-w-0 flex-col">
                  <WorkFrame
                    fit="cover"
                    className="aspect-[3/4] w-full shrink-0"
                  />
                  <p className="mt-1 font-serif text-[11px] leading-tight opacity-70">
                    {t('pending')}
                  </p>
                </div>
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
