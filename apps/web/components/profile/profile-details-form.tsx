'use client';

import type { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { CREATOR_DIRECTIONS, type Profile } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ProfileDetailsFormProps = {
  displayName: string;
  bio: string;
  profile: Profile;
  saving: boolean;
  error: string | null;
  onDisplayNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProfileDetailsForm({
  displayName,
  bio,
  profile,
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
        <span>{t('slug')}</span>
        <Input
          name="slug"
          defaultValue={profile.slug ?? ''}
          minLength={3}
          maxLength={50}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
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

      <fieldset className="flex flex-col gap-2 text-sm">
        <legend>{t('directions')}</legend>
        {CREATOR_DIRECTIONS.map((direction) => (
          <label key={direction} className="flex items-center gap-2">
            <input
              type="checkbox"
              name="directions"
              value={direction}
              defaultChecked={profile.directions.includes(direction)}
            />
            {t(`directionLabels.${direction}`)}
          </label>
        ))}
      </fieldset>

      {(['websiteUrl', 'instagramUrl', 'telegramUrl'] as const).map((name) => (
        <label key={name} className="flex flex-col gap-2 text-sm">
          <span>{t(name)}</span>
          <Input
            type="url"
            name={name}
            defaultValue={profile[name] ?? ''}
            maxLength={500}
          />
        </label>
      ))}

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="acceptPolicies" value="true" required />
        <span>{t('acceptPolicies')}</span>
      </label>

      {error ? <FormError>{error}</FormError> : null}

      <Button type="submit" disabled={saving}>
        {saving ? t('saving') : t('save')}
      </Button>
    </form>
  );
}
