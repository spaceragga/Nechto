'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { logoutRequest, meRequest, type AuthUser } from '@/lib/api';

export function HomeAuthPanel() {
  const t = useTranslations('Auth');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    meRequest()
      .then((response) => {
        if (active) {
          setUser(response.user);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function onLogout() {
    await logoutRequest();
    setUser(null);
  }

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
          <button
            type="button"
            onClick={onLogout}
            className="rounded border border-white/30 px-4 py-2"
          >
            {t('logout')}
          </button>
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
