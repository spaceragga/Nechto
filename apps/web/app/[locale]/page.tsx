import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomeAuthPanel } from '@/components/home-auth-panel';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('HomePage');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="text-4xl tracking-wide md:text-6xl">{t('title')}</h1>
      <HomeAuthPanel />
    </main>
  );
}
