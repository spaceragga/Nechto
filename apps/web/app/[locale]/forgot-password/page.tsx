import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { PasswordBackControl } from '@/components/auth/password-back-control';

type RecoveryPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: RecoveryPageProps) {
  const { locale } = await params;
  const { from } = await searchParams;
  setRequestLocale(locale);
  const [t, tProfile] = await Promise.all([
    getTranslations('Recovery.forgot'),
    getTranslations('Profile'),
  ]);

  return (
    <main className="flex flex-1 items-start justify-center px-6 py-16">
      <div className="flex w-full max-w-152 items-start gap-3">
        <PasswordBackControl
          label={
            from === 'profile' ? tProfile('backToAccount') : tProfile('back')
          }
          returnToProfile={from === 'profile'}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <h1 className="font-serif text-3xl tracking-wide">{t('title')}</h1>
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
