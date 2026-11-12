import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { ChromeIconLink } from '@/components/chrome-icon';
import { BrandGlyph } from '@/components/glyphs/brand-glyph';
import { HeaderSearch } from '@/components/header-search';
import { HomeAuthPanel } from '@/components/home-auth-panel';
import { HouseNav } from '@/components/house-nav';

export async function SiteHeader() {
  const t = await getTranslations('Site');
  const tAuth = await getTranslations('Auth');

  return (
    <header className="sticky top-0 z-20 bg-[var(--bg)]">
      <div className="flex w-full items-center gap-4 px-6 py-2">
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
      <HouseNav />
    </header>
  );
}
