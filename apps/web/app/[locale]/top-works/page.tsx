import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExploreWorksPage } from '@/components/explore/explore-works-page';
import { loadPublishedWorks } from '@/lib/load-published-feed';
import { latestWorkPerAuthor } from '@/lib/pick-home-feed';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TopWorksPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('TopWorks');
  const works = latestWorkPerAuthor(await loadPublishedWorks(50));

  return (
    <ExploreWorksPage
      title={t('title')}
      lede={t('lede')}
      empty={t('empty')}
      works={works}
    />
  );
}
