'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AuthUser } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/navigation';
import { logoutRequest } from '@/lib/api';

type HomeAuthPanelClientProps = {
  user: AuthUser | null;
};

export function HomeAuthPanelClient({ user }: HomeAuthPanelClientProps) {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await logoutRequest();
      router.refresh();
    } finally {
      setPending(false);
    }
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
          <Button type="button" onClick={logout} disabled={pending}>
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
