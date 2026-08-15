import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomeAuthPanel } from '@/components/home-auth-panel';
import { Link } from '@/i18n/navigation';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('HomePage');
  const tAuth = await getTranslations('Auth');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="text-4xl tracking-wide md:text-6xl">{t('title')}</h1>
      <Link href="/creators" className="mt-6 underline">
        {t('creatorsLink')}
      </Link>
      <Suspense
        fallback={
          <p className="mt-8 text-sm opacity-70">{tAuth('checkingSession')}</p>
        }
      >
        <HomeAuthPanel />
      </Suspense>
    </main>
  );
}
