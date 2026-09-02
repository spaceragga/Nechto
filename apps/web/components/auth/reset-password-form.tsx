'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { useHydrated } from '@/hooks/use-hydrated';
import { Link } from '@/i18n/navigation';
import { resetPasswordRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

export function ResetPasswordForm({ token }: { token: string | null }) {
  const t = useTranslations('Recovery');
  const tErrors = useTranslations('Errors');
  const hydrated = useHydrated();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : tErrors('invalidResetToken'),
  );

  async function submit() {
    if (!token) {
      return;
    }
    if (password !== confirmation) {
      setError(t('passwordMismatch'));
      return;
    }

    setPending(true);
    setError(null);
    try {
      await resetPasswordRequest({ token, password });
      setSaved(true);
    } catch (requestError) {
      setError(mapApiErrorMessage(requestError, tErrors));
    } finally {
      setPending(false);
    }
  }

  if (saved) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p role="status">{t('reset.success')}</p>
        <Link href="/login" className="underline">
          {t('login')}
        </Link>
      </div>
    );
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
        <span>{t('password')}</span>
        <Input
          type="password"
          value={password}
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          required
          disabled={!token}
          onChange={(event) => setPassword(event.target.value)}
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
          disabled={!token}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </label>
      {error ? <FormError>{error}</FormError> : null}
      <Button type="submit" disabled={pending || !token || !hydrated}>
        {pending ? t('submitting') : t('reset.submit')}
      </Button>
    </form>
  );
}
