import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PublicProfileView } from '@/components/profile/public-profile-view';
import { loadPublishedProfile } from '@/lib/load-published-feed';
import { getCurrentUser, loadMyProfile } from '@/lib/session';

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

  const [published, session] = await Promise.all([
    loadPublishedProfile(slug),
    getCurrentUser(),
  ]);
  if (!published) {
    notFound();
  }

  const mine =
    session.status === 'authenticated'
      ? await loadMyProfile()
      : { ok: false as const, status: null };
  const isOwner = mine.ok && mine.profile.slug === slug;

  return (
    <PublicProfileView
      profile={published.profile}
      works={published.works}
      projects={published.projects}
      articles={published.articles}
      pane={pane}
      canReport={!isOwner}
      viewerEmail={
        session.status === 'authenticated' ? session.user.email : undefined
      }
    />
  );
}
