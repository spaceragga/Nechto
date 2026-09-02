import { setRequestLocale } from 'next-intl/server';
import { ProfileEditor } from '@/components/profile-editor';
import { loadMyProfile, loadMyWorks } from '@/lib/session';

const PROFILE_ACCOUNT_PANE_INDEX = 0;
const PROFILE_DETAILS_PANE_INDEX = 1;

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pane?: string }>;
};

export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const { locale } = await params;
  const { pane } = await searchParams;
  setRequestLocale(locale);

  const initialPane =
    pane === 'account'
      ? PROFILE_ACCOUNT_PANE_INDEX
      : PROFILE_DETAILS_PANE_INDEX;
  const result = await loadMyProfile();
  const works = result.ok ? await loadMyWorks() : [];

  return (
    <main className="flex flex-1 items-start justify-center px-6 py-16">
      {result.ok ? (
        <ProfileEditor
          profile={result.profile}
          works={works}
          initialPane={initialPane}
        />
      ) : (
        <ProfileEditor
          profile={null}
          errorStatus={result.status}
          initialPane={initialPane}
        />
      )}
    </main>
  );
}
