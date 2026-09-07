import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CREATOR_DIRECTIONS } from '@nechto/api-contract';
import {
  CollectionsGrid,
  type CollectionChannel,
} from '@/components/collections/collections-grid';
import { loadPublishedWorks } from '@/lib/load-published-feed';
import { worksByDirection } from '@/lib/pick-home-feed';
import { toUploadSrc } from '@/lib/to-upload-src';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CollectionsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Collections');
  const tCreators = await getTranslations('Creators');
  const grouped = worksByDirection(await loadPublishedWorks(50));

  const channels: CollectionChannel[] = CREATOR_DIRECTIONS.flatMap(
    (direction) => {
      const works = grouped.get(direction);
      const cover = works?.[0];
      if (!works?.length || !cover) {
        return [];
      }
      return [
        {
          href: `/creators?direction=${direction}`,
          title: tCreators(`directions.${direction}`),
          meta: t('worksCount', { count: works.length }),
          src: toUploadSrc(cover.imageUrl),
        },
      ];
    },
  );

  return (
    <CollectionsGrid
      title={t('title')}
      lede={t('lede')}
      empty={t('empty')}
      channels={channels}
    />
  );
}
