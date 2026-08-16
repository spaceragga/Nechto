import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DirectionChips } from '@/components/direction-chips';
import { HomeCreatorsRail } from '@/components/home/home-creators-rail';
import { HomeExploreNav } from '@/components/home/home-explore-nav';
import { HomeFeaturedColumn } from '@/components/home/home-featured-column';
import { HomeFragmentsRail } from '@/components/home/home-fragments-rail';
import { HomeGrowthSpots } from '@/components/home/home-growth-spots';
import { HomeNow } from '@/components/home/home-now';
import { HomeWorksGrid } from '@/components/home/home-works-grid';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('HomePage');

  return (
    <main className="flex w-full flex-col gap-10 px-6 py-10">
      <div className="flex flex-col gap-5">
        <header>
          <h1 className="font-serif text-4xl tracking-wide md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-sm opacity-70">
            {t('subtitle')}
          </p>
          <div className="mt-4">
            <HomeExploreNav />
          </div>
        </header>

        <div className="flex flex-wrap gap-4">
          <HomeFeaturedColumn />
          <HomeNow />
        </div>

        <HomeGrowthSpots />

        <DirectionChips />
      </div>
      <HomeWorksGrid />
      <HomeCreatorsRail />
      <HomeFragmentsRail />
    </main>
  );
}
