'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function ProfileAccountField() {
  const t = useTranslations('Account');
  const tRecovery = useTranslations('Recovery');

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl tracking-wide">{t('title')}</h2>
      <ul className="flex flex-col gap-3 text-sm">
        <li>{t('export')}</li>
        <li>{t('resendVerification')}</li>
        <li>{t('delete')}</li>
        <li>
          <Link href="/forgot-password" className="underline">
            {tRecovery('forgot.title')}
          </Link>
        </li>
        <li>
          <Link href="/change-password" className="underline">
            {t('changePassword')}
          </Link>
        </li>
      </ul>
    </section>
  );
}
