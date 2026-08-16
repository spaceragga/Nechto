import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StubPage } from '@/components/stub-page';

type RecoveryPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ForgotPasswordPage({
  params,
}: RecoveryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Recovery.forgot');

  return <StubPage title={t('title')} body={t('success')} />;
}
