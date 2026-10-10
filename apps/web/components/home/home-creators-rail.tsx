import { getTranslations } from 'next-intl/server';
import { FluidRail } from '@/components/ui/fluid-rail';
import { MediaTile } from '@/components/ui/media-tile';
import type { PublishedCreator } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { Link } from '@/i18n/navigation';
import { profilePath } from '@/lib/work-path';

type HomeCreatorsRailProps = {
  creators?: PublishedCreator[];
  empty?: string;
  catalogHref?: string;
};

export async function HomeCreatorsRail({
  creators = [],
  empty,
  catalogHref = '/creators',
}: HomeCreatorsRailProps) {
  const t = await getTranslations('HomePage');
  const tCreators = await getTranslations('Creators');

  return (
    <section id="creators" aria-label={t('creators')}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="font-sans text-2xl tracking-wide">{t('creators')}</h2>
        <Link href={catalogHref} className="font-sans text-base opacity-80">
          {t('creatorsLink')}
        </Link>
      </div>
      {creators.length > 0 ? (
        <FluidRail minItem="8.5rem" grow={false} className="items-start">
          {creators.map((creator) => (
            <MediaTile
              key={creator.slug}
              href={profilePath(creator.slug)}
              title={creator.displayName ?? creator.slug}
              subtitle={
                creator.directions[0]
                  ? tCreators(`directions.${creator.directions[0]}`)
                  : undefined
              }
              src={toUploadSrc(creator.avatarUrl)}
              fit="cover"
              captionSize="sm"
              wellClassName="aspect-3/4 w-full"
            />
          ))}
        </FluidRail>
      ) : (
        <p className="text-sm opacity-70">{empty ?? t('pending')}</p>
      )}
    </section>
  );
}
