import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PasswordBackControl } from '@/components/auth/password-back-control';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

type RecoveryPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  params,
  searchParams,
}: RecoveryPageProps) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  const [t, tProfile] = await Promise.all([
    getTranslations('Recovery.reset'),
    getTranslations('Profile'),
  ]);

  return (
    <main className="flex flex-1 items-start justify-center px-6 py-16">
      <div className="flex w-full max-w-152 items-start gap-3">
        <PasswordBackControl label={tProfile('back')} returnToProfile={false} />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <h1 className="font-serif text-3xl tracking-wide">{t('title')}</h1>
          <ResetPasswordForm token={token ?? null} />
        </div>
      </div>
    </main>
  );
}
