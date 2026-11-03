import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PublicProfileView } from '@/components/profile/public-profile-view';
import { loadPublishedProfile } from '@/lib/load-published-feed';
import { loadReportViewer } from '@/lib/report-viewer';

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

  const [published, viewer] = await Promise.all([
    loadPublishedProfile(slug),
    loadReportViewer(),
  ]);
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
      canReport={viewer.viewerSlug !== slug}
      viewerEmail={viewer.viewerEmail}
    />
  );
}
