import type { ReactNode } from 'react';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LocaleLayout' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations('LocaleLayout');

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <div className="fixed right-4 top-4 z-10">
            <LanguageSwitcher />
          </div>
          {children}
          <footer className="flex flex-wrap justify-center gap-4 border-t px-6 py-8 text-sm">
            <Link href="/terms">{t('terms')}</Link>
            <Link href="/privacy">{t('privacy')}</Link>
            <Link href="/community-guidelines">{t('community')}</Link>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
