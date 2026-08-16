import { getTranslations } from 'next-intl/server';
import { HomeNowRow, type HomeNowItem } from '@/components/home/home-now-row';

type NowItemSource = {
  author: string;
  direction: string;
  works: HomeNowItem['works'];
};

export async function HomeNow() {
  const t = await getTranslations('HomePage');
  const tCreators = await getTranslations('Creators');
  const items = (t.raw('nowItems') as NowItemSource[]).map((item) => ({
    author: item.author,
    directionLabel: tCreators(`directions.${item.direction}`),
    works: item.works,
  }));

  return (
    <aside
      aria-label={t('nowLabel')}
      className="flex min-w-0 flex-1 basis-80 scroll-mt-20 flex-col gap-2 overflow-hidden rounded border border-white/15 bg-black/20 p-2"
      id="now"
    >
      <p className="px-1 text-xs tracking-[0.2em] uppercase">{t('nowLabel')}</p>
      {items.map((item) => (
        <HomeNowRow key={item.author} item={item} />
      ))}
    </aside>
  );
}
