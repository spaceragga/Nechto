import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JournalIndex } from '@/components/journal/journal-index';
import { loadPublishedArticles } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { articlePath } from '@/lib/work-path';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function JournalPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Journal');
  const articles = await loadPublishedArticles(40);

  return (
    <JournalIndex
      title={t('title')}
      lede={t('lede')}
      empty={t('empty')}
      articles={articles.map((article) => ({
        href: articlePath(article.id),
        title: article.title,
        meta: article.author.displayName,
        lede: article.lede,
        src: toUploadSrc(article.coverImageUrl),
      }))}
    />
  );
}
