'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import {
  forgotPasswordRequest,
  resetPasswordRequest,
  verifyEmailRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

type AuthRecoveryFormProps = {
  mode: 'forgot' | 'reset' | 'verify';
  token?: string;
};

export function AuthRecoveryForm({ mode, token }: AuthRecoveryFormProps) {
  const t = useTranslations('Recovery');
  const tErrors = useTranslations('Errors');
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const needsToken = mode === 'reset' || mode === 'verify';
  const tokenMissing = needsToken && !token;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tokenMissing || pending) {
      return;
    }
    const data = new FormData(event.currentTarget);
    setError(null);
    setPending(true);
    try {
      if (mode === 'forgot') {
        await forgotPasswordRequest(String(data.get('email') ?? ''));
      } else if (mode === 'reset' && token) {
        await resetPasswordRequest(token, String(data.get('password') ?? ''));
      } else if (mode === 'verify' && token) {
        await verifyEmailRequest(token);
      }
      setSent(true);
    } catch (requestError) {
      setError(mapApiErrorMessage(requestError, tErrors));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl">{t(`${mode}.title`)}</h1>
      {sent ? (
        <>
          <p className="mt-4">{t(`${mode}.success`)}</p>
          {mode === 'reset' ? (
            <Link href="/login" className="mt-4 underline">
              {t('signIn')}
            </Link>
          ) : null}
        </>
      ) : (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          {mode === 'forgot' ? (
            <Input
              name="email"
              type="email"
              required
              aria-label={t('email')}
              placeholder={t('email')}
            />
          ) : null}
          {mode === 'reset' && !tokenMissing ? (
            <Input
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              aria-label={t('password')}
              placeholder={t('password')}
            />
          ) : null}
          {tokenMissing ? <FormError>{t('missingToken')}</FormError> : null}
          {error ? <FormError>{error}</FormError> : null}
          {tokenMissing ? null : (
            <Button type="submit" disabled={pending}>
              {t(`${mode}.submit`)}
            </Button>
          )}
        </form>
      )}
    </main>
  );
}
