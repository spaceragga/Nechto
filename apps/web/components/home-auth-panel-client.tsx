'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AuthUser } from '@nechto/api-contract';
import { FormError } from '@/components/ui/form-error';
import { HoverTip } from '@/components/ui/hover-tip';
import { LoginGlyph } from '@/components/login-glyph';
import { LogoutGlyph } from '@/components/logout-glyph';
import { ProfileGlyph } from '@/components/profile-glyph';
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
      <div className="flex flex-wrap items-center gap-4">
        <HoverTip label={t('signedInAs', { email: user.email })}>
          <Link
            href="/profile"
            aria-label={t('profileLink')}
            className="inline-flex opacity-80 transition-opacity duration-150 hover:opacity-100"
          >
            <ProfileGlyph />
          </Link>
        </HoverTip>
        <HoverTip label={t('logout')}>
          <button
            type="button"
            aria-label={t('logout')}
            onClick={logout}
            disabled={pending}
            className="inline-flex opacity-80 transition-opacity duration-150 hover:opacity-100 disabled:opacity-30"
          >
            <LogoutGlyph />
          </button>
        </HoverTip>
        {logoutError ? (
          <FormError>{tErrors('serviceUnavailable')}</FormError>
        ) : null}
      </div>
    );
  }

  return (
    <HoverTip label={t('loginLink')}>
      <Link
        href="/login"
        aria-label={t('loginLink')}
        className="inline-flex opacity-80 transition-opacity duration-150 hover:opacity-100"
      >
        <LoginGlyph />
      </Link>
    </HoverTip>
  );
}
