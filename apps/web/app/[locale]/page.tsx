import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DirectionChips } from '@/components/direction-chips';
import { HomeCreatorsRail } from '@/components/home/home-creators-rail';
import { HomeExploreNav } from '@/components/home/home-explore-nav';
import { HomeFragmentsRail } from '@/components/home/home-fragments-rail';
import { HomeHangingSpot } from '@/components/home/home-hanging-spot';
import { HomeStage } from '@/components/home/home-stage';
import { HomeWorksGrid } from '@/components/home/home-works-grid';
import { CREATOR_DIRECTION_IDS } from '@/lib/creator-directions';
import {
  loadPublishedCreators,
  loadPublishedWorks,
  loadPublishedWorksPage,
} from '@/lib/load-published-feed';
import { pickHomeFeed } from '@/lib/pick-home-feed';
import { shuffled } from '@/lib/shuffle';

type HomePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ direction?: string }>;
};

export default async function HomePage({
  params,
  searchParams,
}: HomePageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const direction = CREATOR_DIRECTION_IDS.find(
    (item) => item === query.direction,
  );
  const t = await getTranslations('HomePage');
  const [stageWorks, stageCreators, railWorks, filteredCreators, fragments] =
    await Promise.all([
      loadPublishedWorks(24),
      loadPublishedCreators({ limit: 12 }),
      direction
        ? loadPublishedWorksPage({ limit: 24, direction })
        : Promise.resolve(null),
      direction
        ? loadPublishedCreators({ limit: 12, direction })
        : Promise.resolve(null),
      loadPublishedWorksPage({ limit: 12 }),
    ]);
  const feed = pickHomeFeed(stageWorks, stageCreators);
  const works = direction ? (railWorks?.items ?? []) : stageWorks;
  const creators = direction ? (filteredCreators ?? []) : stageCreators;

  return (
    <main className="flex w-full flex-col gap-6 px-6 py-6">
      <div className="flex flex-col gap-4">
        <header>
          <h1 className="font-serif text-4xl tracking-wide md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-2 max-w-2xl font-sans text-sm opacity-70">
            {t('subtitle')}
          </p>
          <HomeExploreNav />
        </header>

        <HomeStage
          locale={locale}
          works={stageWorks}
          creators={stageCreators}
        />

        <HomeHangingSpot works={feed.hanging} />

        <DirectionChips active={direction} basePath="/" />
      </div>
      <HomeWorksGrid
        works={works}
        empty={direction ? t('emptyWorks') : undefined}
      />
      <HomeCreatorsRail
        creators={creators}
        empty={direction ? t('emptyCreators') : undefined}
        catalogHref={
          direction ? `/creators?direction=${direction}` : '/creators'
        }
      />
      <HomeFragmentsRail
        feed={{
          items: shuffled(fragments.items),
          nextCursor: fragments.nextCursor,
        }}
      />
    </main>
  );
}
