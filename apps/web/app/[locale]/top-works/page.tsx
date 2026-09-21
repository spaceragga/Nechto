import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExploreCatalogPage } from '@/components/explore/explore-catalog-page';
import { loadPublishedWorks } from '@/lib/load-published-feed';
import { latestWorkPerAuthor } from '@/lib/pick-home-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TopWorksPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('TopWorks');
  const works = latestWorkPerAuthor(await loadPublishedWorks(50));

  return (
    <ExploreCatalogPage
      title={t('title')}
      lede={t('lede')}
      empty={t('empty')}
      items={works.map((work) => ({
        id: work.id,
        href: workPath(work.author.slug, work.id),
        title: work.title,
        subtitle: work.author.displayName,
        src: toUploadSrc(work.imageUrl),
      }))}
    />
  );
}
