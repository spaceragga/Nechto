'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AuthUser } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Link, useRouter } from '@/i18n/navigation';
import { logoutRequest } from '@/lib/api';

type HomeAuthPanelClientProps = {
  user: AuthUser | null;
  unavailable: boolean;
};

export function HomeAuthPanelClient({
  user,
  unavailable,
}: HomeAuthPanelClientProps) {
  const t = useTranslations('Auth');
  const tErrors = useTranslations('Errors');
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

  async function logout() {
    setPending(true);
    setLogoutError(false);
    try {
      await logoutRequest();
      router.refresh();
    } catch {
      setLogoutError(true);
    } finally {
      setPending(false);
    }
  }

  if (unavailable) {
    return (
      <div>
        <FormError>{tErrors('serviceUnavailable')}</FormError>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <p className="max-w-[14rem] truncate">
          {t('signedInAs')} <span className="opacity-90">{user.email}</span>
        </p>
        <Link href="/profile" className="underline">
          {t('profileLink')}
        </Link>
        <Button type="button" onClick={logout} disabled={pending}>
          {t('logout')}
        </Button>
        {logoutError ? (
          <FormError>{tErrors('serviceUnavailable')}</FormError>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex gap-3 text-sm">
      <Link href="/login" className="underline">
        {t('loginLink')}
      </Link>
      <Link href="/register" className="underline">
        {t('registerLink')}
      </Link>
    </div>
  );
}
