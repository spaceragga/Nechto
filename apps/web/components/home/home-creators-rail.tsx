import { getTranslations } from 'next-intl/server';
import { FluidRail } from '@/components/ui/fluid-rail';
import { MediaTile } from '@/components/ui/media-tile';
import { type DemoStillKind } from '@/lib/demo-media';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';
import { loadPublishedCreators } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { Link } from '@/i18n/navigation';

const CREATOR_STILLS: DemoStillKind[] = [
  'portrait',
  'coat',
  'film',
  'glass',
  'stool',
  'lamp',
  'stair',
  'alley',
];

type CreatorCard = {
  name: string;
  direction: string;
};

export async function HomeCreatorsRail() {
  const t = await getTranslations('HomePage');
  const tCreators = await getTranslations('Creators');
  const published = await loadPublishedCreators({ limit: 8 });

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-sans text-xl tracking-wide">{t('creators')}</h2>
        <Link href="/creators" className="font-sans text-sm underline">
          {t('creatorsLink')}
        </Link>
      </div>
      <FluidRail minItem="11rem">
        {published.length > 0
          ? published.map((creator) => {
              const cover =
                creator.latestWorks[0]?.imageUrl ?? creator.avatarUrl;
              return (
                <MediaTile
                  key={creator.slug}
                  href={`/u/${creator.slug}`}
                  title={creator.displayName ?? creator.slug}
                  subtitle={
                    creator.directions[0]
                      ? tCreators(`directions.${creator.directions[0]}`)
                      : undefined
                  }
                  src={toUploadSrc(cover)}
                  wellClassName="h-40 w-full"
                />
              );
            })
          : (t.raw('creatorCards') as CreatorCard[]).map((card, index) => (
              <MediaTile
                key={card.name}
                href={DEMO_PROFILE_HREF}
                title={card.name}
                subtitle={tCreators(`directions.${card.direction}`)}
                still={CREATOR_STILLS[index % CREATOR_STILLS.length]}
                wellClassName="h-40 w-full"
              />
            ))}
      </FluidRail>
    </section>
  );
}
