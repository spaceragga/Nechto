'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type AppLocale } from '@/i18n/routing';

export function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function onChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale as AppLocale });
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
            className="bg-[#0f1115] text-[#f4f1ea]"
          >
            {t(item)}
          </option>
        ))}
      </select>
    </label>
  );
}
