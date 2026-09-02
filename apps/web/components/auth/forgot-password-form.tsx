'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { useHydrated } from '@/hooks/use-hydrated';
import { forgotPasswordRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

export function ForgotPasswordForm() {
  const t = useTranslations('Recovery');
  const tErrors = useTranslations('Errors');
  const locale = useLocale();
  const hydrated = useHydrated();
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      await forgotPasswordRequest({
        email,
        locale: locale === 'en' ? 'en' : 'ru',
      });
      setSent(true);
    } catch (requestError) {
      setError(mapApiErrorMessage(requestError, tErrors));
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return <p role="status">{t('forgot.success')}</p>;
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
        <span>{t('email')}</span>
        <Input
          type="email"
          value={email}
          autoComplete="email"
          required
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      {error ? <FormError>{error}</FormError> : null}
      <Button type="submit" disabled={pending || !hydrated}>
        {pending ? t('submitting') : t('forgot.submit')}
      </Button>
    </form>
  );
}
