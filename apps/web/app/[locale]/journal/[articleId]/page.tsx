import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { JournalArticleView } from '@/components/journal/journal-article-view';
import { loadPublishedArticle } from '@/lib/load-published-feed';

type PageProps = {
  params: Promise<{ locale: string; articleId: string }>;
};

export default async function JournalArticlePage({ params }: PageProps) {
  const { locale, articleId } = await params;
  setRequestLocale(locale);
  const article = await loadPublishedArticle(articleId);
  if (!article) {
    notFound();
  }
  return <JournalArticleView article={article} />;
}
