'use client';

import { useTranslations } from 'next-intl';
import type { Profile, Work } from '@nechto/api-contract';
import { WorkManager } from '@/components/profile/work-manager';
import { AccountActions } from '@/components/profile/account-actions';
import { ProfileAvatarField } from '@/components/profile/profile-avatar-field';
import { ProfileDetailsForm } from '@/components/profile/profile-details-form';
import { FormError } from '@/components/ui/form-error';
import { useMyProfile } from '@/hooks/use-my-profile';
import { Link } from '@/i18n/navigation';
import type { LoadFailureKind } from '@/lib/session';

type ProfileEditorProps = {
  profile: Profile | null;
  works?: Work[];
  errorKind?: LoadFailureKind;
};

export function ProfileEditor({
  profile,
  works = [],
  errorKind,
}: ProfileEditorProps) {
  const t = useTranslations('Profile');
  const tErrors = useTranslations('Errors');

  if (!profile) {
    const message =
      errorKind === 'unauthorized'
        ? tErrors('unauthorized')
        : errorKind === 'unavailable'
          ? tErrors('serviceUnavailable')
          : tErrors('unknown');

    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-3 text-sm">
        <h1 className="text-3xl tracking-wide">{t('title')}</h1>
        <FormError>{message}</FormError>
        {errorKind === 'unauthorized' ? (
          <Link href="/login" className="underline">
            {t('loginLink')}
          </Link>
        ) : null}
      </div>
    );
  }

  return <ProfileEditorForm profile={profile} works={works} />;
}

function ProfileEditorForm({
  profile,
  works,
}: {
  profile: Profile;
  works: Work[];
}) {
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
        profile={current}
        displayName={displayName}
        bio={bio}
        saving={saving}
        error={error}
        onDisplayNameChange={setDisplayName}
        onBioChange={setBio}
        onSubmit={saveProfile}
      />

      <WorkManager initialWorks={works} slug={current.slug} />
      <AccountActions />

      <p className="text-sm opacity-70">
        {t('signedInAs')} {current.email}
      </p>
    </div>
  );
}
