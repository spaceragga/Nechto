'use client';

import { useTranslations } from 'next-intl';
import { ProfileAvatarField } from '@/components/profile/profile-avatar-field';
import { ProfileDetailsForm } from '@/components/profile/profile-details-form';
import { FormError } from '@/components/ui/form-error';
import { useMyProfile } from '@/hooks/use-my-profile';
import { Link } from '@/i18n/navigation';

export function ProfileEditor() {
  const t = useTranslations('Profile');
  const tErrors = useTranslations('Errors');
  const {
    profile,
    displayName,
    setDisplayName,
    bio,
    setBio,
    loading,
    saving,
    uploading,
    error,
    saveProfile,
    uploadAvatar,
  } = useMyProfile();

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <h1 className="text-3xl tracking-wide">{t('title')}</h1>
        <p className="text-sm opacity-70">{t('loading')}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-3 text-sm">
        <h1 className="text-3xl tracking-wide">{t('title')}</h1>
        <FormError>{error ?? tErrors('unknown')}</FormError>
        <Link href="/login" className="underline">
          {t('loginLink')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="text-3xl tracking-wide">{t('title')}</h1>
        <p className="mt-2 text-sm opacity-70">{t('subtitle')}</p>
      </div>

      <ProfileAvatarField
        avatarUrl={profile.avatarUrl}
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
        {t('signedInAs')} {profile.email}
      </p>
    </div>
  );
}
