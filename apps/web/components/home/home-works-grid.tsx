import { getTranslations } from 'next-intl/server';
import { FluidRail } from '@/components/ui/fluid-rail';
import { MediaTile } from '@/components/ui/media-tile';
import type { WorkWithAuthor } from '@nechto/api-contract';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type HomeWorksGridProps = {
  works?: WorkWithAuthor[];
  empty?: string;
};

export async function HomeWorksGrid({ works = [], empty }: HomeWorksGridProps) {
  const t = await getTranslations('HomePage');

  return (
    <section id="works" className="scroll-mt-20">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-sans text-xl tracking-wide">{t('works')}</h2>
        <Link href="/new" className="font-sans text-sm">
          {t('seeAll')}
        </Link>
      </div>
      {works.length > 0 ? (
        <FluidRail minItem="16rem">
          {works.map((work) => (
            <MediaTile
              key={work.id}
              href={workPath(work.author.slug, work.id)}
              title={work.title}
              subtitle={work.author.displayName}
              src={toUploadSrc(work.imageUrl)}
            />
          ))}
        </FluidRail>
      ) : (
        <p className="text-sm opacity-70">{empty ?? t('pending')}</p>
      )}
    </section>
  );
}
