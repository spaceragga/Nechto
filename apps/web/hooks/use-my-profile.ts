'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  updateMyProfileRequest,
  uploadMyAvatarRequest,
  type Profile,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

export function useMyProfile(initialProfile: Profile) {
  const tErrors = useTranslations('Errors');
  const [profile, setProfile] = useState(initialProfile);
  const [displayName, setDisplayName] = useState(
    initialProfile.displayName ?? '',
  );
  const [bio, setBio] = useState(initialProfile.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updated = await updateMyProfileRequest({
        displayName: displayName.trim() || null,
        bio: bio.trim() || null,
      });
      setProfile(updated);
    } catch (saveError) {
      setError(mapApiErrorMessage(saveError, tErrors));
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const updated = await uploadMyAvatarRequest(file);
      setProfile(updated);
    } catch (uploadError) {
      setError(mapApiErrorMessage(uploadError, tErrors));
    } finally {
      setUploading(false);
    }
  }

  return {
    profile,
    displayName,
    setDisplayName,
    bio,
    setBio,
    saving,
    uploading,
    error,
    saveProfile,
    uploadAvatar,
  };
}
