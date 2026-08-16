import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function SiteFooter() {
  const t = await getTranslations('LocaleLayout');

  return (
    <footer className="mt-auto border-t border-white/15 px-6 py-8 text-sm">
      <nav className="mx-auto flex max-w-6xl flex-wrap justify-center gap-4">
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
    </footer>
  );
}
