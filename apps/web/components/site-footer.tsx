import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Link } from '@/i18n/navigation';

export async function SiteFooter() {
  const t = await getTranslations('LocaleLayout');
  const links = [
    { href: '/terms' as const, label: t('terms') },
    { href: '/community-guidelines' as const, label: t('community') },
    { href: '/privacy' as const, label: t('privacy') },
  ];

  return (
    <footer className="mt-auto px-6 pt-8 pb-4">
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm leading-tight">
          <nav className="flex flex-wrap items-center justify-center gap-x-3">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[color-mix(in_srgb,var(--fg)_78%,transparent)] transition-colors duration-150 hover:text-[var(--accent)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span
            aria-hidden="true"
            className="hidden h-3 w-px bg-[color-mix(in_srgb,var(--fg)_28%,transparent)] sm:block"
          />
          <LanguageSwitcher />
        </div>
        <svg
          viewBox="0 0 360 16"
          className="h-auto w-[min(18rem,72vw)] text-[var(--accent)]"
          fill="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="footer-curve" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0" />
              <stop offset="0.12" stopColor="var(--accent)" />
              <stop offset="0.74" stopColor="var(--accent)" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M8 9.6C52 11 96 4.2 168 6.4 236 8.4 292 12.2 352 7.4"
            stroke="url(#footer-curve)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <p className="font-serif text-base tracking-[0.14em]">
          <span>{t('studio')}</span>
          <span className="tracking-normal text-[color-mix(in_srgb,var(--fg)_48%,transparent)]">
            {' '}
            {t('copyright')}
          </span>
        </p>
      </div>
    </footer>
  );
}
