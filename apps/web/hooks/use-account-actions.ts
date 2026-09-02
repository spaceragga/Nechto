'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Profile } from '@nechto/api-contract';
import { useRouter } from '@/i18n/navigation';
import {
  deleteAccountRequest,
  restoreAccountRequest,
  suspendAccountRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

type AccountAction = 'suspend' | 'restore' | 'delete';

export function useAccountActions(onProfileChange: (profile: Profile) => void) {
  const tErrors = useTranslations('Errors');
  const router = useRouter();
  const [pending, setPending] = useState<AccountAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(action: 'suspend' | 'restore') {
    setPending(action);
    setError(null);
    try {
      const profile =
        action === 'suspend'
          ? await suspendAccountRequest()
          : await restoreAccountRequest();
      onProfileChange(profile);
    } catch (requestError) {
      setError(mapApiErrorMessage(requestError, tErrors));
    } finally {
      setPending(null);
    }
  }

  async function deleteAccount(password: string): Promise<boolean> {
    setPending('delete');
    setError(null);
    try {
      await deleteAccountRequest({ password });
      router.replace('/');
      router.refresh();
      return true;
    } catch (requestError) {
      setError(mapApiErrorMessage(requestError, tErrors));
      return false;
    } finally {
      setPending(null);
    }
  }

  return {
    pending,
    error,
    suspend: () => updateStatus('suspend'),
    restore: () => updateStatus('restore'),
    deleteAccount,
  };
}
