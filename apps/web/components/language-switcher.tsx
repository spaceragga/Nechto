'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useHydrated } from '@/hooks/use-hydrated';
import { useRouter } from '@/i18n/navigation';
import { routing, type AppLocale } from '@/i18n/routing';

function hrefWithoutLocale(pathname: string, locale: string) {
  if (locale === routing.defaultLocale) {
    return pathname || '/';
  }
  const prefix = `/${locale}`;
  if (pathname === prefix) {
    return '/';
  }
  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length);
  }
  return pathname;
}

export function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const hydrated = useHydrated();

  function onChange(nextLocale: string) {
    // Read the browser URL at click time. usePathname() in the chrome layout
    // can stay on the parent /[slug] after client-navigating into a work.
    const href = hrefWithoutLocale(window.location.pathname, locale);
    router.replace(href, { locale: nextLocale as AppLocale });
  }

  return (
    <label className="flex items-center text-sm leading-tight tracking-wide text-[color-mix(in_srgb,var(--fg)_62%,transparent)]">
      <span className="sr-only">{t('label')}</span>
      <select
        data-language-switch
        className="cursor-pointer py-0 pr-4"
        value={locale}
        disabled={!hydrated}
        onChange={(event) => onChange(event.target.value)}
      >
        {routing.locales.map((item) => (
          <option key={item} value={item}>
            {t(item)}
          </option>
        ))}
      </select>
    </label>
  );
}
