'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AuthUser } from '@nechto/api-contract';
import { ChromeIconButton, ChromeIconLink } from '@/components/chrome-icon';
import { AdminGlyph } from '@/components/glyphs/admin-glyph';
import { CuratorGlyph } from '@/components/glyphs/curator-glyph';
import { DoorGlyph } from '@/components/glyphs/door-glyph';
import { GearGlyph } from '@/components/glyphs/gear-glyph';
import { ProfileGlyph } from '@/components/glyphs/profile-glyph';
import { ShieldGlyph } from '@/components/glyphs/shield-glyph';
import { FormError } from '@/components/ui/form-error';
import { useHydrated } from '@/hooks/use-hydrated';
import { usePathname, useRouter } from '@/i18n/navigation';
import { logoutRequest } from '@/lib/api';
import { profilePath } from '@/lib/work-path';

type HomeAuthPanelClientProps = {
  user: AuthUser | null;
  vitrineSlug: string | null;
  unavailable: boolean;
};

export function HomeAuthPanelClient({
  user,
  vitrineSlug,
  unavailable,
}: HomeAuthPanelClientProps) {
  const t = useTranslations('Auth');
  const tStaff = useTranslations('Staff');
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
      const fromProfileRecovery =
        pathname === '/forgot-password' &&
        new URLSearchParams(window.location.search).get('from') === 'profile';
      if (
        pathname === '/profile' ||
        pathname === '/change-password' ||
        fromProfileRecovery
      ) {
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
        {vitrineSlug ? (
          <ChromeIconLink
            href={profilePath(vitrineSlug)}
            label={t('vitrineLink')}
            tip={t('vitrineLink')}
          >
            <ProfileGlyph />
          </ChromeIconLink>
        ) : null}
        <ChromeIconLink
          href="/profile"
          label={t('profileLink')}
          tip={t('profileLink')}
        >
          <GearGlyph />
        </ChromeIconLink>
        {user.isCurator ? (
          <ChromeIconLink
            href="/curation"
            label={tStaff('curator')}
            tip={tStaff('curator')}
          >
            <CuratorGlyph />
          </ChromeIconLink>
        ) : null}
        {user.isModerator ? (
          <ChromeIconLink
            href="/moderation"
            label={tStaff('moderator')}
            tip={tStaff('moderator')}
          >
            <ShieldGlyph />
          </ChromeIconLink>
        ) : null}
        {user.isAdmin ? (
          <ChromeIconLink
            href="/admin"
            label={tStaff('admin')}
            tip={tStaff('admin')}
          >
            <AdminGlyph />
          </ChromeIconLink>
        ) : null}
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
