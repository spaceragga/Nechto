import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PublicProfileView } from '@/components/profile/public-profile-view';
import { loadPublishedProfile } from '@/lib/load-published-feed';

type PublicProfilePageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ pane?: string }>;
};

export default async function PublicProfilePage({
  params,
  searchParams,
}: PublicProfilePageProps) {
  const { locale, slug } = await params;
  const { pane } = await searchParams;
  setRequestLocale(locale);

  const published = await loadPublishedProfile(slug);
  if (!published) {
    notFound();
  }

  return (
    <PublicProfileView
      profile={published.profile}
      works={published.works}
      projects={published.projects}
      articles={published.articles}
      pane={pane}
    />
  );
}
