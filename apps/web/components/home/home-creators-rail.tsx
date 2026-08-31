import { getTranslations } from 'next-intl/server';
import { FluidRail } from '@/components/ui/fluid-rail';
import { MediaTile } from '@/components/ui/media-tile';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';
import type { PublishedCreator } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { Link } from '@/i18n/navigation';

type CreatorCard = {
  name: string;
  direction: string;
};

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
  const showDemo = creators.length === 0 && !empty;

  return (
    <section id="creators" aria-label={t('creators')}>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-sans text-xl tracking-wide">{t('creators')}</h2>
        <Link href={catalogHref} className="font-sans text-sm underline">
          {t('creatorsLink')}
        </Link>
      </div>
      {creators.length > 0 ? (
        <FluidRail minItem="8.5rem" grow={false}>
          {creators.map((creator) => (
            <MediaTile
              key={creator.slug}
              href={`/u/${creator.slug}`}
              title={creator.displayName ?? creator.slug}
              subtitle={
                creator.directions[0]
                  ? tCreators(`directions.${creator.directions[0]}`)
                  : undefined
              }
              src={toUploadSrc(creator.avatarUrl)}
              fit="cover"
              wellClassName="aspect-3/4 w-full"
            />
          ))}
        </FluidRail>
      ) : showDemo ? (
        <FluidRail minItem="8.5rem" grow={false}>
          {(t.raw('creatorCards') as CreatorCard[]).map((card) => (
            <MediaTile
              key={card.name}
              href={DEMO_PROFILE_HREF}
              title={card.name}
              subtitle={tCreators(`directions.${card.direction}`)}
              still="portrait"
              fit="cover"
              wellClassName="aspect-3/4 w-full"
            />
          ))}
        </FluidRail>
      ) : (
        <p className="text-sm opacity-70">{empty}</p>
      )}
    </section>
  );
}
