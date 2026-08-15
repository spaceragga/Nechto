'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { useRouter } from '@/i18n/navigation';
import {
  deleteMyAccountRequest,
  exportMyAccountRequest,
  resendVerificationRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

export function AccountActions() {
  const t = useTranslations('Account');
  const tErrors = useTranslations('Errors');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  async function resendVerification() {
    try {
      await resendVerificationRequest();
      setVerificationSent(true);
    } catch (requestError) {
      setError(mapApiErrorMessage(requestError, tErrors));
    }
  }

  async function exportData() {
    try {
      const data = await exportMyAccountRequest();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'nechto-account.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(mapApiErrorMessage(requestError, tErrors));
    }
  }

  async function deleteAccount() {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await deleteMyAccountRequest();
      router.replace('/');
      router.refresh();
    } catch (requestError) {
      setError(mapApiErrorMessage(requestError, tErrors));
    }
  }

  return (
    <section className="flex flex-col gap-3 border-t pt-6">
      <h2 className="text-xl">{t('title')}</h2>
      <Button type="button" onClick={() => void exportData()}>
        {t('export')}
      </Button>
      <Button type="button" onClick={() => void resendVerification()}>
        {t('resendVerification')}
      </Button>
      {verificationSent ? <p>{t('verificationSent')}</p> : null}
      <Button type="button" onClick={() => void deleteAccount()}>
        {t('delete')}
      </Button>
      {error ? <FormError>{error}</FormError> : null}
    </section>
  );
}
