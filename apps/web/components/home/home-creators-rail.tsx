import { getTranslations } from 'next-intl/server';
import { FluidRail } from '@/components/ui/fluid-rail';
import { MediaTile } from '@/components/ui/media-tile';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';
import { Link } from '@/i18n/navigation';

type CreatorCard = {
  name: string;
  direction: string;
};

export async function HomeCreatorsRail() {
  const t = await getTranslations('HomePage');
  const tCreators = await getTranslations('Creators');
  const cards = t.raw('creatorCards') as CreatorCard[];

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-sans text-xl tracking-wide">{t('creators')}</h2>
        <Link href="/creators" className="font-sans text-sm underline">
          {t('creatorsLink')}
        </Link>
      </div>
      <FluidRail minItem="11rem">
        {cards.map((card) => (
          <MediaTile
            key={card.name}
            href={DEMO_PROFILE_HREF}
            title={card.name}
            subtitle={tCreators(`directions.${card.direction}`)}
            still="portrait"
            wellClassName="h-40 w-full"
          />
        ))}
      </FluidRail>
    </section>
  );
}
