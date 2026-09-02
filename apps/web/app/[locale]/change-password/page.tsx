import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { PasswordBackControl } from '@/components/auth/password-back-control';
import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { getCurrentUser } from '@/lib/session';

type ChangePasswordPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function ChangePasswordPage({
  params,
  searchParams,
}: ChangePasswordPageProps) {
  const { locale } = await params;
  const { from } = await searchParams;
  setRequestLocale(locale);
  const session = await getCurrentUser();

  if (session.status === 'anonymous') {
    redirect({ href: '/', locale: locale as AppLocale });
  }

  const [t, tProfile] = await Promise.all([
    getTranslations('Account'),
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
          <h1 className="font-serif text-3xl tracking-wide">
            {t('changePassword')}
          </h1>
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
