import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { MediaTile } from '@/components/ui/media-tile';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';

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
        <h2 className="text-xl tracking-wide">{t('creators')}</h2>
        <Link href="/creators" className="text-sm underline">
          {t('creatorsLink')}
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {cards.map((card) => (
          <MediaTile
            key={card.name}
            href={DEMO_PROFILE_HREF}
            title={card.name}
            subtitle={tCreators(`directions.${card.direction}`)}
            className="w-40 shrink-0"
          >
            <div className="aspect-square bg-white/10" />
          </MediaTile>
        ))}
      </div>
    </section>
  );
}
