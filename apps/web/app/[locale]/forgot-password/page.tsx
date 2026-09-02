import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { PasswordBackControl } from '@/components/auth/password-back-control';
import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { getCurrentUser } from '@/lib/session';

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

  if (from === 'profile') {
    const session = await getCurrentUser();
    if (session.status === 'anonymous') {
      redirect({ href: '/', locale: locale as AppLocale });
    }
  } else if (from !== 'login') {
    redirect({ href: '/login', locale: locale as AppLocale });
  }

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
