import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StubPage } from '@/components/stub-page';

type RecoveryPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ResetPasswordPage({ params }: RecoveryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Recovery.reset');

  return <StubPage title={t('title')} body={t('success')} />;
}
