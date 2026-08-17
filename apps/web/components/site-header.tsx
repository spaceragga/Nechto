import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { HomeAuthPanel } from '@/components/home-auth-panel';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Link } from '@/i18n/navigation';

export async function SiteHeader() {
  const t = await getTranslations('Site');
  const tAuth = await getTranslations('Auth');

  return (
    <header className="sticky top-0 z-20 border-b border-white/15 bg-[var(--bg)] px-6 py-2">
      <div className="flex w-full items-center gap-4">
        <Link href="/" className="font-sans text-sm tracking-[0.14em]">
          {t('brand')}
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Suspense
            fallback={
              <p className="text-sm opacity-70">{tAuth('checkingSession')}</p>
            }
          >
            <HomeAuthPanel />
          </Suspense>
          <Link
            href="/account"
            className="font-sans text-sm opacity-80 hover:opacity-100"
          >
            {t('account')}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
