import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DirectionChips } from '@/components/direction-chips';
import { HomeCreatorsRail } from '@/components/home/home-creators-rail';
import { HomeExploreNav } from '@/components/home/home-explore-nav';
import { HomeFragmentsRail } from '@/components/home/home-fragments-rail';
import { HomeHangingSpot } from '@/components/home/home-hanging-spot';
import { HomeStage } from '@/components/home/home-stage';
import { HomeWorksGrid } from '@/components/home/home-works-grid';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('HomePage');

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

        <HomeStage />

        <HomeHangingSpot />

        <DirectionChips />
      </div>
      <HomeWorksGrid />
      <HomeCreatorsRail />
      <HomeFragmentsRail />
    </main>
  );
}
