import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Link } from '@/i18n/navigation';

export async function SiteFooter() {
  const t = await getTranslations('LocaleLayout');

  return (
    <footer className="mt-auto border-t border-white/15 px-6 py-8 text-sm">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <nav className="flex flex-wrap justify-center gap-4">
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
        <LanguageSwitcher />
      </div>
    </footer>
  );
}
