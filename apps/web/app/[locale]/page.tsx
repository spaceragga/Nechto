import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DirectionChips } from '@/components/direction-chips';
import { HomeBillboard } from '@/components/home/home-billboard';
import { HomeCreatorsRail } from '@/components/home/home-creators-rail';
import { HomeFragmentsRail } from '@/components/home/home-fragments-rail';
import { HomeSideTicker } from '@/components/home/home-side-ticker';
import { HomeWorksGrid } from '@/components/home/home-works-grid';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('HomePage');

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <header>
        <h1 className="text-4xl tracking-wide md:text-6xl">{t('title')}</h1>
        <p className="mt-3 max-w-2xl text-sm opacity-70">{t('subtitle')}</p>
      </header>

      <div className="flex flex-col gap-4 md:flex-row">
        <HomeBillboard />
        <HomeSideTicker />
      </div>

      <DirectionChips />
      <HomeWorksGrid />
      <HomeCreatorsRail />
      <HomeFragmentsRail />
    </main>
  );
}
