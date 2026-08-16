import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StubPage } from '@/components/stub-page';

type ChangePasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ChangePasswordPage({
  params,
}: ChangePasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Account');

  return <StubPage title={t('changePassword')} />;
}
