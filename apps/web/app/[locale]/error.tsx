'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

type ErrorPageProps = {
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  const t = useTranslations('System');

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl tracking-wide">{t('errorTitle')}</h1>
      <p className="mt-3 text-sm opacity-70">{t('errorBody')}</p>
      <Button type="button" className="mt-6 self-start" onClick={reset}>
        {t('retry')}
      </Button>
    </main>
  );
}
