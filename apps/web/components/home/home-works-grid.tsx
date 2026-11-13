import { getTranslations } from 'next-intl/server';
import { HomeSplitTile } from '@/components/home/home-split-tile';
import { FluidRail } from '@/components/ui/fluid-rail';
import type { WorkWithAuthor } from '@nechto/api-contract';
import { toUploadSrc } from '@/lib/to-upload-src';
import { profilePath, workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type HomeWorksGridProps = {
  works?: WorkWithAuthor[];
  empty?: string;
  catalogHref?: string;
};

export async function HomeWorksGrid({
  works = [],
  empty,
  catalogHref = '/works',
}: HomeWorksGridProps) {
  const t = await getTranslations('HomePage');

  return (
    <section id="works" className="scroll-mt-20">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="font-sans text-2xl tracking-wide">{t('works')}</h2>
        <Link href={catalogHref} className="accent-mark">
          {t('seeAll')}
        </Link>
      </div>
      {works.length > 0 ? (
        <FluidRail minItem="16rem" className="items-start">
          {works.map((work) => (
            <HomeSplitTile
              key={work.id}
              imageHref={workPath(work.author.slug, work.id)}
              alt={work.title}
              title={work.title}
              src={toUploadSrc(work.imageUrl)}
              credits={[
                {
                  label: work.author.displayName,
                  href: profilePath(work.author.slug),
                },
              ]}
            />
          ))}
        </FluidRail>
      ) : (
        <p className="text-sm opacity-70">{empty ?? t('pending')}</p>
      )}
    </section>
  );
}
