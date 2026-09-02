import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChangePasswordForm } from '@/components/auth/change-password-form';

type ChangePasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ChangePasswordPage({
  params,
}: ChangePasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Account');

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <h1 className="font-serif text-3xl tracking-wide">
        {t('changePassword')}
      </h1>
      <ChangePasswordForm />
    </main>
  );
}
