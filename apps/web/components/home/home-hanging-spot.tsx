import { getTranslations } from 'next-intl/server';
import { WorkFrame } from '@/components/ui/work-frame';
import type { WorkWithAuthor } from '@nechto/api-contract';
import { toUploadSrc } from '@/lib/to-upload-src';
import { profilePath, workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type HomeHangingSpotProps = {
  works?: WorkWithAuthor[];
};

export async function HomeHangingSpot({ works = [] }: HomeHangingSpotProps) {
  const t = await getTranslations('HomePage');
  const live = works.slice(0, 5);

  return (
    <section aria-label={t('hangingSpot.kicker')} className="py-4">
      <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col text-center">
        <div className="grid grid-cols-5 items-stretch gap-2">
          {live.length > 0
            ? live.map((work) => (
                <div key={work.id} className="flex min-w-0 flex-col">
                  <Link
                    href={workPath(work.author.slug, work.id)}
                    className="block"
                  >
                    <WorkFrame
                      src={toUploadSrc(work.imageUrl)}
                      alt={work.title}
                      fit="cover"
                      className="aspect-[3/4] w-full shrink-0"
                    />
                  </Link>
                  <p className="mt-1.5 truncate text-center font-serif text-sm leading-tight">
                    {work.title}
                  </p>
                  <Link
                    href={profilePath(work.author.slug)}
                    className="home-credit mt-0.5 max-w-full self-center truncate text-center font-serif text-sm"
                  >
                    {work.author.displayName}
                  </Link>
                </div>
              ))
            : Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex min-w-0 flex-col">
                  <WorkFrame
                    fit="cover"
                    className="aspect-[3/4] w-full shrink-0"
                  />
                  <p className="mt-1.5 font-serif text-sm leading-tight opacity-70">
                    {t('pending')}
                  </p>
                </div>
              ))}
        </div>
        <div className="mt-3 flex flex-col text-center">
          <p className="font-sans text-sm tracking-[0.16em] uppercase opacity-80">
            {t('hangingSpot.kicker')}
          </p>
          <h2 className="mt-1 font-serif text-2xl leading-tight tracking-wide md:text-3xl">
            {t('hangingSpot.title')}
          </h2>
          <p className="mt-1 font-sans text-base leading-relaxed opacity-70">
            {t('hangingSpot.lede')}
          </p>
          <Link
            href="/hanging"
            className="accent-mark mt-2 self-center font-sans text-base"
          >
            {t('hangingSpot.cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
