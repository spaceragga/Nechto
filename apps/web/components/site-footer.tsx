import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function SiteFooter() {
  const t = await getTranslations('LocaleLayout');
  const tAuth = await getTranslations('Auth');
  const tRecovery = await getTranslations('Recovery');
  const tAccount = await getTranslations('Account');

  return (
    <footer className="mt-auto border-t border-white/15 px-6 py-8 text-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:flex-wrap md:justify-between">
        <nav className="flex flex-wrap gap-4">
          <Link href="/terms" className="underline">
            {t('terms')}
          </Link>
          <Link href="/privacy" className="underline">
            {t('privacy')}
          </Link>
          <Link href="/community-guidelines" className="underline">
            {t('community')}
          </Link>
        </nav>
        <nav className="flex flex-wrap gap-4 opacity-80">
          <Link href="/account">{tAccount('title')}</Link>
          <Link href="/profile">{tAuth('profileLink')}</Link>
          <Link href="/forgot-password">{tRecovery('forgot.title')}</Link>
          <Link href="/reset-password">{tRecovery('reset.title')}</Link>
          <Link href="/verify-email">{tRecovery('verify.title')}</Link>
        </nav>
      </div>
    </footer>
  );
}
