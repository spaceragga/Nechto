import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HangingWall } from '@/components/hanging/hanging-wall';
import { catalogHref } from '@/lib/catalog-query';
import { loadCommunityPeople } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cursor?: string }>;
};

export default async function HangingPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('Hanging');
  const page = await loadCommunityPeople({
    limit: 24,
    cursor: query.cursor,
  });

  return (
    <HangingWall
      title={t('title')}
      lede={t('lede')}
      empty={t('empty')}
      more={t('more')}
      nextHref={
        page.nextCursor
          ? catalogHref('/hanging', { cursor: page.nextCursor })
          : null
      }
      frames={page.items.flatMap((creator) => {
        const work = creator.latestWorks[0];
        if (!creator.slug || !work) {
          return [];
        }
        return [
          {
            id: work.id,
            href: workPath(creator.slug, work.id),
            title: work.title,
            author: creator.displayName ?? creator.slug,
            src: toUploadSrc(work.imageUrl),
          },
        ];
      })}
    />
  );
}
