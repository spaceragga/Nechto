import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExploreWorksPage } from '@/components/explore/explore-works-page';
import { loadPublishedWorksPage } from '@/lib/load-published-feed';

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
    <ExploreWorksPage
      title={t('title')}
      lede={t('lede')}
      empty={t('empty')}
      more={t('more')}
      nextHref={page.nextCursor ? `/new?cursor=${page.nextCursor}` : null}
      works={page.items}
    />
  );
}
