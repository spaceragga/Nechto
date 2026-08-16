import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

type AccountPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Account');
  const tAuth = await getTranslations('Auth');
  const tRecovery = await getTranslations('Recovery');

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl tracking-wide">{t('title')}</h1>
      <ul className="mt-8 flex flex-col gap-3 text-sm">
        <li>{t('export')}</li>
        <li>{t('resendVerification')}</li>
        <li>{t('delete')}</li>
        <li>
          <Link href="/forgot-password" className="underline">
            {tRecovery('forgot.title')}
          </Link>
        </li>
        <li>
          <Link href="/change-password" className="underline">
            {t('changePassword')}
          </Link>
        </li>
      </ul>
      <Link href="/profile" className="mt-8 inline-block underline">
        {tAuth('profileLink')}
      </Link>
    </main>
  );
}
