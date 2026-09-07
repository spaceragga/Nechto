import { getTranslations } from 'next-intl/server';
import type { CursorPage, WorkWithAuthor } from '@nechto/api-contract';
import { HomeFragmentsFeed } from '@/components/home/home-fragments-feed';

type HomeFragmentsRailProps = {
  feed: CursorPage<WorkWithAuthor>;
};

export async function HomeFragmentsRail({ feed }: HomeFragmentsRailProps) {
  const t = await getTranslations('HomePage');

  if (feed.items.length > 0) {
    return <HomeFragmentsFeed initial={feed} />;
  }

  return (
    <section id="fragments" className="scroll-mt-20">
      <h2 className="mb-3 font-sans text-xl tracking-wide">{t('fragments')}</h2>
      <p className="text-sm opacity-70">{t('pending')}</p>
    </section>
  );
}
