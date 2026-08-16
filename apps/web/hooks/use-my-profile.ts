'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  updateMyProfileRequest,
  uploadMyAvatarRequest,
  type Profile,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { toUploadSrc } from '@/lib/to-upload-src';

export function useMyProfile(initialProfile: Profile) {
  const tErrors = useTranslations('Errors');
  const [profile, setProfile] = useState(initialProfile);
  const [displayName, setDisplayNameValue] = useState(
    initialProfile.displayName ?? '',
  );
  const [bio, setBioValue] = useState(initialProfile.bio ?? '');
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function setDisplayName(value: string) {
    setDisplayNameValue(value);
    setSaved(false);
  }

  function setBio(value: string) {
    setBioValue(value);
    setSaved(false);
  }

  function selectAvatar(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    setPendingAvatar(file);
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
    setError(null);
    setSaved(false);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      let updated = await updateMyProfileRequest({
        displayName: displayName.trim() || null,
        bio: bio.trim() || null,
      });

      if (pendingAvatar) {
        updated = await uploadMyAvatarRequest(pendingAvatar);
        setPendingAvatar(null);
        setPreviewUrl((current) => {
          if (current) {
            URL.revokeObjectURL(current);
          }
          return null;
        });
      }

      setProfile(updated);
      setSaved(true);
      setFileInputKey((key) => key + 1);
    } catch (saveError) {
      setError(mapApiErrorMessage(saveError, tErrors));
    } finally {
      setSaving(false);
    }
  }

  return {
    profile,
    displayName,
    setDisplayName,
    bio,
    setBio,
    avatarUrl: previewUrl ?? toUploadSrc(profile.avatarUrl),
    saving,
    error,
    saved,
    fileInputKey,
    selectAvatar,
    saveProfile,
  };
}
