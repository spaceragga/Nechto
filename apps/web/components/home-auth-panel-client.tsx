'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AuthUser } from '@nechto/api-contract';
import { ChromeIconButton, ChromeIconLink } from '@/components/chrome-icon';
import { DoorGlyph } from '@/components/glyphs/door-glyph';
import { ProfileGlyph } from '@/components/glyphs/profile-glyph';
import { FormError } from '@/components/ui/form-error';
import { useHydrated } from '@/hooks/use-hydrated';
import { usePathname, useRouter } from '@/i18n/navigation';
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
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const hydrated = useHydrated();

  async function logout() {
    setPending(true);
    setLogoutError(false);
    try {
      await logoutRequest();
      if (pathname === '/profile') {
        router.replace('/');
      }
      router.refresh();
    } catch {
      setLogoutError(true);
    } finally {
      setPending(false);
    }
  }

  if (unavailable) {
    return <FormError>{tErrors('serviceUnavailable')}</FormError>;
  }

  if (user) {
    return (
      <div
        className="flex flex-wrap items-center gap-4"
        data-auth-hydrated={hydrated ? 'true' : 'false'}
      >
        <ChromeIconLink
          href="/profile"
          label={t('profileLink')}
          tip={t('signedInAs', { email: user.email })}
        >
          <ProfileGlyph />
        </ChromeIconLink>
        <ChromeIconButton
          label={t('logout')}
          tip={t('logout')}
          onClick={logout}
          disabled={pending}
        >
          <DoorGlyph direction="out" />
        </ChromeIconButton>
        {logoutError ? (
          <FormError>{tErrors('serviceUnavailable')}</FormError>
        ) : null}
      </div>
    );
  }

  return (
    <ChromeIconLink href="/login" label={t('loginLink')} tip={t('loginLink')}>
      <DoorGlyph direction="in" />
    </ChromeIconLink>
  );
}
