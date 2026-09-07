import { getTranslations } from 'next-intl/server';
import { HomeNowRow, type HomeNowItem } from '@/components/home/home-now-row';
import type { PublishedCreator } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath, profilePath } from '@/lib/work-path';

type HomeNowProps = {
  creators?: PublishedCreator[];
};

export async function HomeNow({ creators = [] }: HomeNowProps) {
  const t = await getTranslations('HomePage');
  const tCreators = await getTranslations('Creators');
  const items: HomeNowItem[] = creators.slice(0, 3).map((creator) => ({
    id: creator.slug,
    author: creator.displayName ?? creator.slug,
    href: profilePath(creator.slug),
    directionLabel: creator.directions[0]
      ? tCreators(`directions.${creator.directions[0]}`)
      : '',
    avatarSrc: toUploadSrc(creator.avatarUrl),
    works: creator.latestWorks.map((work) => ({
      title: work.title,
      href: workPath(creator.slug, work.id),
      src: toUploadSrc(work.imageUrl),
    })),
  }));

  return (
    <aside
      aria-label={t('nowLabel')}
      className="flex min-w-0 shrink-0 flex-col gap-3"
    >
      <p className="px-1 font-sans text-xs tracking-[0.2em] uppercase">
        {t('nowLabel')}
      </p>
      {items.length > 0 ? (
        items.map((item) => <HomeNowRow key={item.id} item={item} />)
      ) : (
        <p className="px-1 font-serif text-sm opacity-70">{t('pending')}</p>
      )}
    </aside>
  );
}
