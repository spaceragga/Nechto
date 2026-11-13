import { getTranslations } from 'next-intl/server';
import { HomeSplitTile } from '@/components/home/home-split-tile';
import { FluidRail } from '@/components/ui/fluid-rail';
import { catalogHref as worksDirectionHref } from '@/lib/catalog-query';
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
        <Link href={catalogHref} className="accent-mark font-sans text-base">
          {t('creatorsLink')}
        </Link>
      </div>
      {creators.length > 0 ? (
        <FluidRail minItem="8.5rem" grow={false} className="items-start">
          {creators.map((creator) => (
            <HomeSplitTile
              key={creator.slug}
              imageHref={profilePath(creator.slug)}
              alt={creator.displayName ?? creator.slug}
              title={creator.displayName ?? creator.slug}
              titleHref={profilePath(creator.slug)}
              src={toUploadSrc(creator.avatarUrl)}
              fit="cover"
              frameClassName="aspect-3/4 w-full"
              credits={
                creator.directions[0]
                  ? [
                      {
                        label: tCreators(`directions.${creator.directions[0]}`),
                        href: worksDirectionHref('/works', {
                          direction: creator.directions[0],
                        }),
                      },
                    ]
                  : []
              }
            />
          ))}
        </FluidRail>
      ) : (
        <p className="text-sm opacity-70">{empty ?? t('pending')}</p>
      )}
    </section>
  );
}
