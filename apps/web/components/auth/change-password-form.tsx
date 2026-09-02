'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { useHydrated } from '@/hooks/use-hydrated';
import { changePasswordRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

export function ChangePasswordForm() {
  const t = useTranslations('Recovery');
  const tErrors = useTranslations('Errors');
  const hydrated = useHydrated();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (newPassword !== confirmation) {
      setSaved(false);
      setError(t('passwordMismatch'));
      return;
    }

    setPending(true);
    setSaved(false);
    setError(null);
    try {
      await changePasswordRequest({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
      setSaved(true);
    } catch (requestError) {
      setError(mapApiErrorMessage(requestError, tErrors));
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('currentPassword')}</span>
        <Input
          type="password"
          value={currentPassword}
          autoComplete="current-password"
          required
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('password')}</span>
        <Input
          type="password"
          value={newPassword}
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          required
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('confirmPassword')}</span>
        <Input
          type="password"
          value={confirmation}
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          required
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </label>
      {error ? <FormError>{error}</FormError> : null}
      {saved ? <p role="status">{t('change.success')}</p> : null}
      <Button type="submit" disabled={pending || !hydrated}>
        {pending ? t('submitting') : t('change.submit')}
      </Button>
    </form>
  );
}
