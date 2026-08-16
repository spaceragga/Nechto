'use client';

import { FormEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Link, getPathname } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { loginRequest, registerRequest } from '@/lib/api';
import { mapAuthFormError } from '@/lib/map-api-error';

type AuthFormProps = {
  mode: 'login' | 'register';
};

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations('Auth');
  const tErrors = useTranslations('Errors');
  const locale = useLocale() as AppLocale;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      if (mode === 'register') {
        await registerRequest({ email, password });
      } else {
        await loginRequest({ email, password });
      }
      // Full navigation so RSC loaders see the new auth cookie.
      window.location.assign(getPathname({ locale, href: '/' }));
    } catch (submitError) {
      setError(mapAuthFormError(submitError, tErrors));
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-4"
    >
      <h1 className="text-3xl tracking-wide">
        {mode === 'login' ? t('loginTitle') : t('registerTitle')}
      </h1>
      <p className="text-sm opacity-70">
        {mode === 'login' ? t('loginSubtitle') : t('registerSubtitle')}
      </p>

      <label className="flex flex-col gap-2 text-sm">
        <span>{t('email')}</span>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span>{t('password')}</span>
        <Input
          type="password"
          name="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={mode === 'register' ? 8 : 1}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error ? <FormError>{error}</FormError> : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? t('submitting')
          : mode === 'login'
            ? t('loginSubmit')
            : t('registerSubmit')}
      </Button>

      <p className="text-sm opacity-70">
        {mode === 'login' ? (
          <>
            {t('noAccount')}{' '}
            <Link href="/register" className="underline">
              {t('registerLink')}
            </Link>
            <br />
            <Link href="/forgot-password" className="underline">
              {t('forgotPassword')}
            </Link>
          </>
        ) : (
          <>
            {t('hasAccount')}{' '}
            <Link href="/login" className="underline">
              {t('loginLink')}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
