import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CREATOR_DIRECTIONS } from '@nechto/api-contract';
import {
  CollectionsGrid,
  type CollectionChannel,
} from '@/components/collections/collections-grid';
import {
  loadPublishedProjects,
  loadPublishedWorks,
} from '@/lib/load-published-feed';
import { worksByDirection } from '@/lib/pick-home-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { projectPath } from '@/lib/work-path';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CollectionsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Collections');
  const tCreators = await getTranslations('Creators');
  const [works, projects] = await Promise.all([
    loadPublishedWorks(50),
    loadPublishedProjects({ limit: 50 }),
  ]);
  const grouped = worksByDirection(works);

  const series: CollectionChannel[] = projects.map((project) => ({
    href: projectPath(project.author.slug, project.id),
    title: project.title,
    meta: t('seriesCount', {
      author: project.author.displayName,
      count: project.blockCount,
    }),
    src: toUploadSrc(project.coverImageUrl),
  }));

  const channels: CollectionChannel[] = CREATOR_DIRECTIONS.flatMap(
    (direction) => {
      const directionWorks = grouped.get(direction);
      const cover = directionWorks?.[0];
      if (!directionWorks?.length || !cover) {
        return [];
      }
      return [
        {
          href: `/creators?direction=${direction}`,
          title: tCreators(`directions.${direction}`),
          meta: t('worksCount', { count: directionWorks.length }),
          src: toUploadSrc(cover.imageUrl),
        },
      ];
    },
  );

  return (
    <CollectionsGrid
      title={t('title')}
      lede={t('lede')}
      seriesHeading={t('series')}
      directionsHeading={t('directions')}
      emptySeries={t('emptySeries')}
      empty={t('empty')}
      series={series}
      channels={channels}
    />
  );
}
