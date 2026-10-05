'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type {
  CreatorDirection,
  Profile,
  UpdateProfileDto,
} from '@nechto/api-contract';
import {
  updateMyProfileRequest,
  uploadMyAvatarRequest,
  uploadMyStudioCoverRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { toUploadSrc } from '@/lib/to-upload-src';

export type PersistProfileResult =
  { ok: true; profile: Profile } | { ok: false; message: string };

export function useMyProfile(initialProfile: Profile) {
  const tErrors = useTranslations('Errors');
  const [profile, setProfile] = useState(initialProfile);
  const [displayName, setDisplayNameValue] = useState(
    initialProfile.displayName ?? '',
  );
  const [bio, setBioValue] = useState(initialProfile.bio ?? '');
  const [slug, setSlugValue] = useState(initialProfile.slug ?? '');
  const [directions, setDirectionsValue] = useState<CreatorDirection[]>(
    initialProfile.directions ?? [],
  );
  const [websiteUrl, setWebsiteUrlValue] = useState(
    initialProfile.websiteUrl ?? '',
  );
  const [instagramUrl, setInstagramUrlValue] = useState(
    initialProfile.instagramUrl ?? '',
  );
  const [telegramUrl, setTelegramUrlValue] = useState(
    initialProfile.telegramUrl ?? '',
  );
  const [acceptPolicies, setAcceptPoliciesValue] = useState(
    initialProfile.acceptPolicies ?? false,
  );
  const [studioTitle, setStudioTitleValue] = useState(
    initialProfile.studioTitle ?? '',
  );
  const [studioDescription, setStudioDescriptionValue] = useState(
    initialProfile.studioDescription ?? '',
  );
  const [studioOptIn, setStudioOptInValue] = useState(
    initialProfile.inStudio ?? false,
  );
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingStudioCover, setPendingStudioCover] = useState<File | null>(
    null,
  );
  const [studioCoverPreviewUrl, setStudioCoverPreviewUrl] = useState<
    string | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [studioCoverInputKey, setStudioCoverInputKey] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (studioCoverPreviewUrl) {
        URL.revokeObjectURL(studioCoverPreviewUrl);
      }
    };
  }, [previewUrl, studioCoverPreviewUrl]);

  function markDirty() {
    setSaved(false);
    setDirty(true);
  }

  function setDisplayName(value: string) {
    setDisplayNameValue(value);
    markDirty();
  }

  function setBio(value: string) {
    setBioValue(value);
    markDirty();
  }

  function setSlug(value: string) {
    setSlugValue(value);
    markDirty();
  }

  function toggleDirection(direction: CreatorDirection) {
    setDirectionsValue((current) => {
      if (current.includes(direction)) {
        return current.filter((item) => item !== direction);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, direction];
    });
    markDirty();
  }

  function setWebsiteUrl(value: string) {
    setWebsiteUrlValue(value);
    markDirty();
  }

  function setInstagramUrl(value: string) {
    setInstagramUrlValue(value);
    markDirty();
  }

  function setTelegramUrl(value: string) {
    setTelegramUrlValue(value);
    markDirty();
  }

  function setAcceptPolicies(value: boolean) {
    setAcceptPoliciesValue(value);
    markDirty();
  }

  function setStudioTitle(value: string) {
    setStudioTitleValue(value);
    markDirty();
  }

  function setStudioDescription(value: string) {
    setStudioDescriptionValue(value);
    markDirty();
  }

  function setStudioOptIn(value: boolean) {
    setStudioOptInValue(value);
    markDirty();
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
    markDirty();
  }

  function selectStudioCover(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    setPendingStudioCover(file);
    setStudioCoverPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
    setError(null);
    markDirty();
  }

  async function persistProfile(): Promise<PersistProfileResult> {
    setSaving(true);
    setError(null);
    setSaved(false);

    const payload: UpdateProfileDto = {
      displayName: displayName.trim() || null,
      bio: bio.trim() || null,
      slug: slug.trim() || null,
      directions,
      websiteUrl: websiteUrl.trim() || null,
      instagramUrl: instagramUrl.trim() || null,
      telegramUrl: telegramUrl.trim() || null,
      acceptPolicies,
      studioTitle: studioTitle.trim() || null,
      studioDescription: studioDescription.trim() || null,
      studioOptIn,
    };

    try {
      let updated = profile;

      if (pendingStudioCover) {
        updated = await uploadMyStudioCoverRequest(pendingStudioCover);
        setPendingStudioCover(null);
        setStudioCoverPreviewUrl((current) => {
          if (current) {
            URL.revokeObjectURL(current);
          }
          return null;
        });
        setStudioCoverInputKey((key) => key + 1);
      }

      if (pendingAvatar) {
        updated = await uploadMyAvatarRequest(pendingAvatar);
        setPendingAvatar(null);
        setPreviewUrl((current) => {
          if (current) {
            URL.revokeObjectURL(current);
          }
          return null;
        });
        setFileInputKey((key) => key + 1);
      }

      updated = await updateMyProfileRequest(payload);

      setProfile(updated);
      setStudioTitleValue(updated.studioTitle ?? '');
      setStudioDescriptionValue(updated.studioDescription ?? '');
      setStudioOptInValue(updated.inStudio);
      setDirty(false);
      setSaved(true);
      return { ok: true, profile: updated };
    } catch (saveError) {
      const message = mapApiErrorMessage(saveError, tErrors);
      setError(message);
      return { ok: false, message };
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    await persistProfile();
  }

  return {
    profile,
    setProfile,
    displayName,
    setDisplayName,
    bio,
    setBio,
    slug,
    setSlug,
    directions,
    toggleDirection,
    websiteUrl,
    setWebsiteUrl,
    instagramUrl,
    setInstagramUrl,
    telegramUrl,
    setTelegramUrl,
    acceptPolicies,
    setAcceptPolicies,
    studioTitle,
    setStudioTitle,
    studioDescription,
    setStudioDescription,
    studioOptIn,
    setStudioOptIn,
    avatarUrl: previewUrl ?? toUploadSrc(profile.avatarUrl),
    studioCoverUrl:
      studioCoverPreviewUrl ?? toUploadSrc(profile.studioCoverUrl),
    saving,
    error,
    saved,
    dirty,
    fileInputKey,
    studioCoverInputKey,
    selectAvatar,
    selectStudioCover,
    persistProfile,
    saveProfile,
  };
}
