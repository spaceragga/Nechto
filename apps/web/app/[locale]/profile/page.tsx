import { setRequestLocale } from 'next-intl/server';
import { ProfileEditor } from '@/components/profile-editor';

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <ProfileEditor />
    </main>
  );
}
