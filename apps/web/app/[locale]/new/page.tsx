import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExploreCatalogPage } from '@/components/explore/explore-catalog-page';
import { catalogHref } from '@/lib/catalog-query';
import { loadPublishedWorksPage } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cursor?: string }>;
};

export default async function FreshPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('Fresh');
  const page = await loadPublishedWorksPage({
    limit: 24,
    cursor: query.cursor,
  });

  return (
    <ExploreCatalogPage
      title={t('title')}
      lede={t('lede')}
      empty={t('empty')}
      more={t('more')}
      nextHref={
        page.nextCursor
          ? catalogHref('/new', { cursor: page.nextCursor })
          : null
      }
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
