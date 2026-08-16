import { getTranslations } from 'next-intl/server';
import { HomeCollectionSpot } from '@/components/home/home-collection-spot';
import {
  HomeFreshSpot,
  type HomeFreshItem,
} from '@/components/home/home-fresh-spot';
import { HomeJournalSpot } from '@/components/home/home-journal-spot';

export async function HomeGrowthSpots() {
  const t = await getTranslations('HomePage');

  return (
    <section
      aria-label={t('growthSpotsLabel')}
      className="grid gap-10 md:grid-cols-3"
    >
      <HomeJournalSpot
        kicker={t('journalSpot.kicker')}
        title={t('journalSpot.title')}
        lede={t('journalSpot.lede')}
        cta={t('journalSpot.cta')}
      />
      <HomeCollectionSpot
        kicker={t('collectionSpot.kicker')}
        title={t('collectionSpot.title')}
        meta={t('collectionSpot.meta')}
      />
      <HomeFreshSpot
        kicker={t('freshSpot.kicker')}
        seeAll={t('freshSpot.seeAll')}
        items={t.raw('freshSpot.items') as HomeFreshItem[]}
      />
    </section>
  );
}
