import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProfileEditor } from '@/components/profile-editor';
import { loadMyProfile, loadMyWorks } from '@/lib/session';

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Profile');

  return (
    <main className="flex flex-1 items-start justify-center px-6 py-16">
      <Suspense
        fallback={
          <div className="mx-auto flex w-full max-w-md flex-col gap-6">
            <h1 className="font-serif text-3xl tracking-wide">{t('title')}</h1>
            <p className="text-sm opacity-70">{t('loading')}</p>
          </div>
        }
      >
        <ProfilePageContent />
      </Suspense>
    </main>
  );
}

async function ProfilePageContent() {
  const result = await loadMyProfile();
  const works = result.ok ? await loadMyWorks() : [];

  if (!result.ok) {
    return <ProfileEditor profile={null} errorStatus={result.status} />;
  }

  return <ProfileEditor profile={result.profile} works={works} />;
}
