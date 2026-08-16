import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { HomeAuthPanel } from '@/components/home-auth-panel';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Link } from '@/i18n/navigation';

export async function SiteHeader() {
  const t = await getTranslations('Site');
  const tAuth = await getTranslations('Auth');

  return (
    <header className="sticky top-0 z-20 border-b border-white/15 bg-[var(--bg)]/95 px-6 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-4">
        <Link href="/" className="text-lg tracking-wide">
          {t('brand')}
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="opacity-80 hover:opacity-100">
            {t('home')}
          </Link>
          <Link href="/creators" className="opacity-80 hover:opacity-100">
            {t('creators')}
          </Link>
          <Link href="/account" className="opacity-80 hover:opacity-100">
            {t('account')}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Suspense
            fallback={
              <p className="text-sm opacity-70">{tAuth('checkingSession')}</p>
            }
          >
            <HomeAuthPanel />
          </Suspense>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
