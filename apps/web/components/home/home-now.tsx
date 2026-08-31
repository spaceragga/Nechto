import { getTranslations } from 'next-intl/server';
import { HomeNowRow, type HomeNowItem } from '@/components/home/home-now-row';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';
import type { PublishedCreator } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath, profilePath } from '@/lib/work-path';

type NowItemSource = {
  author: string;
  direction: string;
  avatar: HomeNowItem['avatarStill'];
  works: Array<{
    title: string;
    still: NonNullable<HomeNowItem['works'][number]['still']>;
  }>;
};

type HomeNowProps = {
  creators?: PublishedCreator[];
};

export async function HomeNow({ creators = [] }: HomeNowProps) {
  const t = await getTranslations('HomePage');
  const tCreators = await getTranslations('Creators');
  const published = creators.slice(0, 3);

  const items: HomeNowItem[] =
    published.length > 0
      ? published.map((creator) => ({
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
        }))
      : (t.raw('nowItems') as NowItemSource[]).map((item) => ({
          id: `demo-${item.author}`,
          author: item.author,
          href: DEMO_PROFILE_HREF,
          directionLabel: tCreators(`directions.${item.direction}`),
          avatarStill: item.avatar,
          works: item.works.map((work) => ({
            title: work.title,
            href: DEMO_PROFILE_HREF,
            still: work.still,
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
      {items.map((item) => (
        <HomeNowRow key={item.id} item={item} />
      ))}
    </aside>
  );
}
