'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Profile } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { useAccountActions } from '@/hooks/use-account-actions';
import { Link } from '@/i18n/navigation';

type ProfileAccountFieldProps = {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
};

export function ProfileAccountField({
  profile,
  onProfileChange,
}: ProfileAccountFieldProps) {
  const t = useTranslations('Account');
  const tRecovery = useTranslations('Recovery');
  const actions = useAccountActions(onProfileChange);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [password, setPassword] = useState('');

  async function deleteAccount() {
    if (await actions.deleteAccount(password)) {
      setPassword('');
      setConfirmingDelete(false);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-serif text-2xl tracking-wide">{t('title')}</h2>
      <div className="flex flex-col gap-3">
        <p className="text-sm opacity-70">
          {profile.suspendedAt
            ? t(
                profile.publishedAt
                  ? 'suspendedPublishedHint'
                  : 'suspendedHiddenHint',
              )
            : t('activeHint')}
        </p>
        <Button
          type="button"
          disabled={actions.pending !== null}
          onClick={profile.suspendedAt ? actions.restore : actions.suspend}
        >
          {profile.suspendedAt ? t('restore') : t('suspend')}
        </Button>
      </div>

      <nav className="flex flex-col items-start gap-3 text-sm">
        <Link
          href={{ pathname: '/forgot-password', query: { from: 'profile' } }}
          className="underline"
        >
          {tRecovery('forgot.title')}
        </Link>
        <Link
          href={{ pathname: '/change-password', query: { from: 'profile' } }}
          className="underline"
        >
          {t('changePassword')}
        </Link>
      </nav>

      {actions.error ? <FormError>{actions.error}</FormError> : null}

      <div className="flex flex-col gap-3 border-t border-white/15 pt-5">
        {!confirmingDelete ? (
          <Button
            type="button"
            disabled={actions.pending !== null}
            onClick={() => setConfirmingDelete(true)}
          >
            {t('delete')}
          </Button>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void deleteAccount();
            }}
          >
            <p className="text-sm">{t('confirmDelete')}</p>
            <label className="flex flex-col gap-1 text-sm">
              <span>{t('currentPassword')}</span>
              <Input
                type="password"
                value={password}
                autoComplete="current-password"
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={actions.pending === 'delete'}>
                {actions.pending === 'delete' ? t('deleting') : t('delete')}
              </Button>
              <Button
                type="button"
                disabled={actions.pending === 'delete'}
                onClick={() => {
                  setPassword('');
                  setConfirmingDelete(false);
                }}
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
