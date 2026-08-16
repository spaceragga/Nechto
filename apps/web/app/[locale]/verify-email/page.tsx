import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StubPage } from '@/components/stub-page';

type RecoveryPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function VerifyEmailPage({ params }: RecoveryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Recovery.verify');

  return <StubPage title={t('title')} body={t('success')} />;
}
