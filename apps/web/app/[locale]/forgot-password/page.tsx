import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

type RecoveryPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ForgotPasswordPage({
  params,
}: RecoveryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Recovery.forgot');

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <h1 className="font-serif text-3xl tracking-wide">{t('title')}</h1>
      <ForgotPasswordForm />
    </main>
  );
}
