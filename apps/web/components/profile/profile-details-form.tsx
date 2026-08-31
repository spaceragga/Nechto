'use client';

import { useTranslations } from 'next-intl';
import type { CreatorDirection } from '@nechto/api-contract';
import { ProfileDirectionsField } from '@/components/profile/profile-directions-field';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ProfileDetailsFormProps = {
  displayName: string;
  bio: string;
  slug: string;
  directions: CreatorDirection[];
  websiteUrl: string;
  instagramUrl: string;
  telegramUrl: string;
  acceptPolicies: boolean;
  saving: boolean;
  error: string | null;
  saved: boolean;
  onDisplayNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onToggleDirection: (direction: CreatorDirection) => void;
  onWebsiteUrlChange: (value: string) => void;
  onInstagramUrlChange: (value: string) => void;
  onTelegramUrlChange: (value: string) => void;
  onAcceptPoliciesChange: (value: boolean) => void;
};

export function ProfileDetailsForm({
  displayName,
  bio,
  slug,
  directions,
  websiteUrl,
  instagramUrl,
  telegramUrl,
  acceptPolicies,
  saving,
  error,
  saved,
  onDisplayNameChange,
  onBioChange,
  onSlugChange,
  onToggleDirection,
  onWebsiteUrlChange,
  onInstagramUrlChange,
  onTelegramUrlChange,
  onAcceptPoliciesChange,
}: ProfileDetailsFormProps) {
  const t = useTranslations('Profile');

  return (
    <div className="flex flex-col gap-4">
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

      <label className="flex flex-col gap-2 text-sm">
        <span>{t('slug')}</span>
        <Input
          name="slug"
          value={slug}
          onChange={(event) => onSlugChange(event.target.value)}
          maxLength={32}
          autoComplete="off"
        />
        <span className="opacity-70">{t('slugHint')}</span>
      </label>

      <ProfileDirectionsField
        selected={directions}
        onToggle={onToggleDirection}
      />

      <label className="flex flex-col gap-2 text-sm">
        <span>{t('websiteUrl')}</span>
        <Input
          name="websiteUrl"
          type="url"
          value={websiteUrl}
          onChange={(event) => onWebsiteUrlChange(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span>{t('instagramUrl')}</span>
        <Input
          name="instagramUrl"
          type="url"
          value={instagramUrl}
          onChange={(event) => onInstagramUrlChange(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span>{t('telegramUrl')}</span>
        <Input
          name="telegramUrl"
          type="url"
          value={telegramUrl}
          onChange={(event) => onTelegramUrlChange(event.target.value)}
        />
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="acceptPolicies"
          checked={acceptPolicies}
          onChange={(event) => onAcceptPoliciesChange(event.target.checked)}
          className="mt-1"
        />
        <span>{t('acceptPolicies')}</span>
      </label>

      {error ? <FormError>{error}</FormError> : null}
      {saved ? (
        <p className="text-sm opacity-70" role="status">
          {t('saved')}
        </p>
      ) : null}

      <Button type="submit" disabled={saving}>
        {saving ? t('saving') : t('save')}
      </Button>
    </div>
  );
}
