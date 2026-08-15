'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/hooks/use-auth-session';
import { Link } from '@/i18n/navigation';

export function HomeAuthPanel() {
  const t = useTranslations('Auth');
  const { user, loading, logout } = useAuthSession();

  if (loading) {
    return <p className="text-sm opacity-70">{t('checkingSession')}</p>;
  }

  if (user) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 text-sm">
        <p>
          {t('signedInAs')} <span className="opacity-90">{user.email}</span>
        </p>
        <div className="flex gap-4">
          <Link href="/profile" className="underline">
            {t('profileLink')}
          </Link>
          <Button type="button" onClick={logout}>
            {t('logout')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flex gap-4 text-sm">
      <Link href="/login" className="underline">
        {t('loginLink')}
      </Link>
      <Link href="/register" className="underline">
        {t('registerLink')}
      </Link>
    </div>
  );
}
