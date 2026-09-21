import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExploreCatalogPage } from '@/components/explore/explore-catalog-page';
import { catalogHref, parseCatalogDirection } from '@/lib/catalog-query';
import { loadPublishedWorksPage } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cursor?: string; direction?: string }>;
};

export default async function WorksPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const direction = parseCatalogDirection(query.direction);
  const t = await getTranslations('Works');
  const page = await loadPublishedWorksPage({
    limit: 24,
    cursor: query.cursor,
    direction,
  });

  return (
    <ExploreCatalogPage
      title={t('title')}
      lede={t('lede')}
      empty={direction ? t('emptyDirection') : t('emptyCatalog')}
      more={t('more')}
      nextHref={
        page.nextCursor
          ? catalogHref('/works', { direction, cursor: page.nextCursor })
          : null
      }
      direction={direction}
      filterPath="/works"
      items={page.items.map((work) => ({
        id: work.id,
        href: workPath(work.author.slug, work.id),
        title: work.title,
        subtitle: work.author.displayName,
        src: toUploadSrc(work.imageUrl),
      }))}
    />
  );
}
