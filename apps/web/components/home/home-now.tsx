import { getTranslations } from 'next-intl/server';
import { HomeNowRow, type HomeNowItem } from '@/components/home/home-now-row';

type NowItemSource = {
  author: string;
  direction: string;
  avatar: HomeNowItem['avatar'];
  works: HomeNowItem['works'];
};

export async function HomeNow() {
  const t = await getTranslations('HomePage');
  const tCreators = await getTranslations('Creators');
  const items = (t.raw('nowItems') as NowItemSource[]).map((item) => ({
    author: item.author,
    directionLabel: tCreators(`directions.${item.direction}`),
    avatar: item.avatar,
    works: item.works,
  }));

  return (
    <aside
      aria-label={t('nowLabel')}
      className="flex min-w-0 shrink-0 flex-col gap-3"
    >
      <p className="px-1 font-sans text-xs tracking-[0.2em] uppercase">
        {t('nowLabel')}
      </p>
      {items.map((item) => (
        <HomeNowRow key={item.author} item={item} />
      ))}
    </aside>
  );
}
