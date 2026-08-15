'use client';

import type { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ProfileDetailsFormProps = {
  displayName: string;
  bio: string;
  saving: boolean;
  error: string | null;
  onDisplayNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProfileDetailsForm({
  displayName,
  bio,
  saving,
  error,
  onDisplayNameChange,
  onBioChange,
  onSubmit,
}: ProfileDetailsFormProps) {
  const t = useTranslations('Profile');

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span>{t('displayName')}</span>
        <Input
          name="displayName"
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          maxLength={80}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span>{t('bio')}</span>
        <Textarea
          name="bio"
          value={bio}
          onChange={(event) => onBioChange(event.target.value)}
          maxLength={2000}
          rows={4}
        />
      </label>

      {error ? <FormError>{error}</FormError> : null}

      <Button type="submit" disabled={saving}>
        {saving ? t('saving') : t('save')}
      </Button>
    </form>
  );
}
