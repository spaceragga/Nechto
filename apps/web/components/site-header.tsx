import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { ChromeIconLink } from '@/components/chrome-icon';
import { BrandGlyph } from '@/components/glyphs/brand-glyph';
import { HeaderSearch } from '@/components/header-search';
import { HomeAuthPanel } from '@/components/home-auth-panel';

export async function SiteHeader() {
  const t = await getTranslations('Site');
  const tAuth = await getTranslations('Auth');

  return (
    <header className="sticky top-0 z-20 h-12 border-b border-white/15 bg-[var(--bg)] px-6">
      <div className="flex h-full w-full items-center gap-4">
        <ChromeIconLink href="/" label={t('brand')}>
          <BrandGlyph />
        </ChromeIconLink>
        <div className="ml-auto flex items-center gap-4">
          <Suspense fallback={null}>
            <HeaderSearch />
          </Suspense>
          <Suspense
            fallback={
              <p className="text-sm opacity-70">{tAuth('checkingSession')}</p>
            }
          >
            <HomeAuthPanel />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
