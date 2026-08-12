'use client';

import { FormEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, getPathname } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { loginRequest, registerRequest } from '@/lib/api';

type AuthFormProps = {
  mode: 'login' | 'register';
};

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations('Auth');
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
      // Full navigation so HomeAuthPanel remounts with the auth cookie.
      window.location.assign(getPathname({ locale, href: '/' }));
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : t('unknownError'),
      );
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
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded border border-white/20 bg-transparent px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span>{t('password')}</span>
        <input
          type="password"
          name="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={mode === 'register' ? 8 : 1}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded border border-white/20 bg-transparent px-3 py-2"
        />
      </label>

      {error ? (
        <p className="text-sm text-[#e07070]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded border border-white/30 px-4 py-2 text-sm tracking-wide disabled:opacity-50"
      >
        {pending
          ? t('submitting')
          : mode === 'login'
            ? t('loginSubmit')
            : t('registerSubmit')}
      </button>

      <p className="text-sm opacity-70">
        {mode === 'login' ? (
          <>
            {t('noAccount')}{' '}
            <Link href="/register" className="underline">
              {t('registerLink')}
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
