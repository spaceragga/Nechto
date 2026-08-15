'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  getMyProfileRequest,
  updateMyProfileRequest,
  uploadMyAvatarRequest,
  type Profile,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

export function useMyProfile() {
  const tErrors = useTranslations('Errors');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getMyProfileRequest()
      .then((data) => {
        if (!active) {
          return;
        }
        setProfile(data);
        setDisplayName(data.displayName ?? '');
        setBio(data.bio ?? '');
      })
      .catch((loadError) => {
        if (active) {
          setError(mapApiErrorMessage(loadError, tErrors));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [tErrors]);

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
    loading,
    saving,
    uploading,
    error,
    saveProfile,
    uploadAvatar,
  };
}
