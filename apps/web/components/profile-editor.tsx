'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  canPublishProfile,
  PUBLISH_MIN_WORKS,
  type Profile,
  type Work,
} from '@nechto/api-contract';
import { ProfileAvatarField } from '@/components/profile/profile-avatar-field';
import { ProfileDetailsForm } from '@/components/profile/profile-details-form';
import { ProfilePager } from '@/components/profile/profile-pager';
import { ProfilePublishField } from '@/components/profile/profile-publish-field';
import { ProfileWorksField } from '@/components/profile/profile-works-field';
import { FormError } from '@/components/ui/form-error';
import { useHydrated } from '@/hooks/use-hydrated';
import { useMyProfile } from '@/hooks/use-my-profile';
import { useMyWorks } from '@/hooks/use-my-works';
import { publishMyProfileRequest, unpublishMyProfileRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { Link } from '@/i18n/navigation';

type ProfileEditorProps = {
  profile: Profile | null;
  works?: Work[];
  errorStatus?: number | null;
};

export function ProfileEditor({
  profile,
  works = [],
  errorStatus,
}: ProfileEditorProps) {
  const t = useTranslations('Profile');
  const tErrors = useTranslations('Errors');

  if (!profile) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-3 text-sm">
        <h1 className="font-serif text-3xl tracking-wide">{t('title')}</h1>
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

  return <ProfileEditorForm profile={profile} initialWorks={works} />;
}

function ProfileEditorForm({
  profile,
  initialWorks,
}: {
  profile: Profile;
  initialWorks: Work[];
}) {
  const t = useTranslations('Profile');
  const tErrors = useTranslations('Errors');
  const details = useMyProfile(profile);
  const works = useMyWorks(initialWorks);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [pane, setPane] = useState(0);
  const hydrated = useHydrated();

  async function publish() {
    setPublishing(true);
    setPublishError(null);
    try {
      if (details.dirty) {
        const persisted = await details.persistProfile();
        if (!persisted.ok) {
          setPublishError(persisted.message);
          return;
        }
      }
      const updated = await publishMyProfileRequest();
      details.setProfile(updated);
    } catch (error) {
      setPublishError(mapApiErrorMessage(error, tErrors));
    } finally {
      setPublishing(false);
    }
  }

  async function unpublish() {
    setPublishing(true);
    setPublishError(null);
    try {
      const updated = await unpublishMyProfileRequest();
      details.setProfile(updated);
    } catch (error) {
      setPublishError(mapApiErrorMessage(error, tErrors));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div
      className="mx-auto flex w-full max-w-[58rem] flex-col gap-8"
      data-testid="profile-editor"
      data-hydrated={hydrated ? 'true' : 'false'}
      data-profile-pane={pane}
    >
      <ProfilePager
        index={pane}
        prevLabel={t('prevPane')}
        nextLabel={t('nextPane')}
        onIndexChange={setPane}
      >
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-serif text-3xl tracking-wide">{t('title')}</h1>
            <p className="mt-2 text-sm opacity-70">{t('subtitle')}</p>
          </div>
          <form onSubmit={details.saveProfile} className="flex flex-col gap-6">
            <ProfileAvatarField
              avatarUrl={details.avatarUrl}
              uploading={details.saving}
              fileInputKey={details.fileInputKey}
              onFileChange={details.selectAvatar}
            />
            <ProfileDetailsForm
              displayName={details.displayName}
              bio={details.bio}
              slug={details.slug}
              directions={details.directions}
              websiteUrl={details.websiteUrl}
              instagramUrl={details.instagramUrl}
              telegramUrl={details.telegramUrl}
              acceptPolicies={details.acceptPolicies}
              saving={details.saving}
              error={details.error}
              saved={details.saved}
              onDisplayNameChange={details.setDisplayName}
              onBioChange={details.setBio}
              onSlugChange={details.setSlug}
              onToggleDirection={details.toggleDirection}
              onWebsiteUrlChange={details.setWebsiteUrl}
              onInstagramUrlChange={details.setInstagramUrl}
              onTelegramUrlChange={details.setTelegramUrl}
              onAcceptPoliciesChange={details.setAcceptPolicies}
            />
          </form>
          <p className="text-sm opacity-70">
            {t('signedInAs')} {details.profile.email}
          </p>
        </div>

        <ProfileWorksField
          works={works.works}
          title={works.title}
          description={works.description}
          fileInputKey={works.fileInputKey}
          adding={works.adding}
          hasFile={Boolean(works.file)}
          savingId={works.savingId}
          deletingId={works.deletingId}
          error={works.error}
          onTitleChange={works.setTitle}
          onDescriptionChange={works.setDescription}
          onFileChange={works.selectFile}
          onAdd={works.addWork}
          onSave={works.updateWork}
          onDelete={async (workId) => {
            const remaining = works.works.length - 1;
            const ok = await works.deleteWork(workId);
            if (ok && remaining < PUBLISH_MIN_WORKS) {
              details.setProfile({
                ...details.profile,
                publishedAt: null,
                workCount: remaining,
              });
            }
          }}
        />

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl tracking-wide">
            {t('visibilityTitle')}
          </h2>
          <ProfilePublishField
            profile={{ ...details.profile, workCount: works.works.length }}
            ready={canPublishProfile({
              displayName: details.displayName,
              slug: details.slug,
              acceptPolicies: details.acceptPolicies,
              workCount: works.works.length,
            })}
            pending={publishing || details.saving}
            error={publishError}
            onPublish={publish}
            onUnpublish={unpublish}
          />
        </section>
      </ProfilePager>
    </div>
  );
}
