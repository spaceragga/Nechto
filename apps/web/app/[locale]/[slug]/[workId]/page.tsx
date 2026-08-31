import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PublicWorkView } from '@/components/profile/public-work-view';
import {
  loadPublishedProfile,
  loadPublishedWork,
} from '@/lib/load-published-feed';

type PublicWorkPageProps = {
  params: Promise<{ locale: string; slug: string; workId: string }>;
};

export default async function PublicWorkPage({ params }: PublicWorkPageProps) {
  const { locale, slug, workId } = await params;
  setRequestLocale(locale);

  const work = await loadPublishedWork(workId);
  if (!work || work.author.slug !== slug) {
    notFound();
  }

  const published = await loadPublishedProfile(slug);
  const more = (published?.works ?? []).filter((item) => item.id !== work.id);

  return <PublicWorkView work={work} more={more} />;
}
