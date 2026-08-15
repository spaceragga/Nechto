'use client';

import { useTranslations } from 'next-intl';
import type { Profile } from '@nechto/api-contract';
import { ProfileAvatarField } from '@/components/profile/profile-avatar-field';
import { ProfileDetailsForm } from '@/components/profile/profile-details-form';
import { FormError } from '@/components/ui/form-error';
import { useMyProfile } from '@/hooks/use-my-profile';
import { Link } from '@/i18n/navigation';

type ProfileEditorProps = {
  profile: Profile | null;
  errorStatus?: number | null;
};

export function ProfileEditor({ profile, errorStatus }: ProfileEditorProps) {
  const t = useTranslations('Profile');
  const tErrors = useTranslations('Errors');

  if (!profile) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-3 text-sm">
        <h1 className="text-3xl tracking-wide">{t('title')}</h1>
        <FormError>
          {errorStatus === 401 || errorStatus === 403
            ? tErrors('unauthorized')
            : tErrors('unknown')}
        </FormError>
        <Link href="/login" className="underline">
          {t('loginLink')}
        </Link>
      </div>
    );
  }

  return <ProfileEditorForm profile={profile} />;
}

function ProfileEditorForm({ profile }: { profile: Profile }) {
  const t = useTranslations('Profile');
  const {
    profile: current,
    displayName,
    setDisplayName,
    bio,
    setBio,
    saving,
    uploading,
    error,
    saveProfile,
    uploadAvatar,
  } = useMyProfile(profile);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="text-3xl tracking-wide">{t('title')}</h1>
        <p className="mt-2 text-sm opacity-70">{t('subtitle')}</p>
      </div>

      <ProfileAvatarField
        avatarUrl={current.avatarUrl}
        uploading={uploading}
        onFileChange={uploadAvatar}
      />

      <ProfileDetailsForm
        displayName={displayName}
        bio={bio}
        saving={saving}
        error={error}
        onDisplayNameChange={setDisplayName}
        onBioChange={setBio}
        onSubmit={saveProfile}
      />

      <p className="text-sm opacity-70">
        {t('signedInAs')} {current.email}
      </p>
    </div>
  );
}
