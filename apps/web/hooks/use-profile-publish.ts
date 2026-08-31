'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { useMyProfile } from '@/hooks/use-my-profile';
import { publishMyProfileRequest, unpublishMyProfileRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

type PublishableProfile = Pick<
  ReturnType<typeof useMyProfile>,
  'dirty' | 'saving' | 'persistProfile' | 'setProfile'
>;

export function useProfilePublish(details: PublishableProfile) {
  const tErrors = useTranslations('Errors');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

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
      details.setProfile(await publishMyProfileRequest());
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
      details.setProfile(await unpublishMyProfileRequest());
    } catch (error) {
      setPublishError(mapApiErrorMessage(error, tErrors));
    } finally {
      setPublishing(false);
    }
  }

  return {
    publish,
    unpublish,
    publishError,
    pending: publishing || details.saving,
  };
}
