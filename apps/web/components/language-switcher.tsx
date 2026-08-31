'use client';

import { useLocale, useTranslations } from 'next-intl';
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

  function onChange(nextLocale: string) {
    // Read the browser URL at click time. usePathname() in the header layout
    // can stay on the parent /u/[slug] after client-navigating into a work.
    const href = hrefWithoutLocale(window.location.pathname, locale);
    router.replace(href, { locale: nextLocale as AppLocale });
  }

  return (
    <label className="flex items-center gap-2 text-sm tracking-wide opacity-80">
      <span className="sr-only">{t('label')}</span>
      <select
        className="rounded border border-white/20 bg-transparent px-2 py-1"
        value={locale}
        onChange={(event) => onChange(event.target.value)}
      >
        {routing.locales.map((item) => (
          <option
            key={item}
            value={item}
            className="bg-[var(--bg)] text-[var(--fg)]"
          >
            {t(item)}
          </option>
        ))}
      </select>
    </label>
  );
}
