import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DirectionChips } from '@/components/direction-chips';
import { HomeCreatorsRail } from '@/components/home/home-creators-rail';
import { CREATOR_DIRECTION_IDS } from '@/lib/creator-directions';

type CreatorsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ direction?: string }>;
};

export default async function CreatorsPage({
  params,
  searchParams,
}: CreatorsPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const direction = CREATOR_DIRECTION_IDS.find(
    (item) => item === query.direction,
  );
  const t = await getTranslations('Creators');

  return (
    <main className="w-full px-6 py-16">
      <h1 className="font-serif text-4xl tracking-wide">{t('title')}</h1>
      <div className="mt-6">
        <DirectionChips active={direction} />
      </div>
      <p className="mt-10 text-sm opacity-70">{t('empty')}</p>
      <div className="mt-10">
        <HomeCreatorsRail />
      </div>
    </main>
  );
}
