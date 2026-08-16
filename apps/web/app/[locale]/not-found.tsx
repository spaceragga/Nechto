'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFoundPage() {
  const t = useTranslations('System');

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl tracking-wide">{t('notFoundTitle')}</h1>
      <p className="mt-3 text-sm opacity-70">{t('notFoundBody')}</p>
      <Link href="/" className="mt-6 underline">
        {t('home')}
      </Link>
    </main>
  );
}
