'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  getMyProfileRequest,
  updateMyProfileRequest,
  uploadMyAvatarRequest,
  type Profile,
} from '@/lib/api';

export function ProfileEditor() {
  const t = useTranslations('Profile');
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
          setError(
            loadError instanceof Error ? loadError.message : t('unknownError'),
          );
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
  }, [t]);

  async function onSave(event: FormEvent<HTMLFormElement>) {
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
      setError(
        saveError instanceof Error ? saveError.message : t('unknownError'),
      );
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarChange(fileList: FileList | null) {
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
      setError(
        uploadError instanceof Error ? uploadError.message : t('unknownError'),
      );
    } finally {
      setUploading(false);
    }
  }

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
        <p className="text-[#e07070]" role="alert">
          {error ?? t('unknownError')}
        </p>
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

      <div className="flex flex-col items-start gap-3">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote upload URL from API
          <img
            src={profile.avatarUrl}
            alt={t('avatarAlt')}
            className="h-28 w-28 object-cover"
            data-testid="profile-avatar"
          />
        ) : (
          <div
            className="flex h-28 w-28 items-center justify-center border border-white/20 text-xs opacity-60"
            data-testid="profile-avatar-empty"
          >
            {t('noAvatar')}
          </div>
        )}

        <label className="flex flex-col gap-2 text-sm">
          <span>{t('avatar')}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(event) => onAvatarChange(event.target.files)}
          />
        </label>
        {uploading ? (
          <p className="text-sm opacity-70">{t('uploading')}</p>
        ) : null}
      </div>

      <form onSubmit={onSave} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span>{t('displayName')}</span>
          <input
            name="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={80}
            className="rounded border border-white/20 bg-transparent px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span>{t('bio')}</span>
          <textarea
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={2000}
            rows={4}
            className="rounded border border-white/20 bg-transparent px-3 py-2"
          />
        </label>

        {error ? (
          <p className="text-sm text-[#e07070]" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded border border-white/30 px-4 py-2 text-sm tracking-wide disabled:opacity-50"
        >
          {saving ? t('saving') : t('save')}
        </button>
      </form>

      <p className="text-sm opacity-70">
        {t('signedInAs')} {profile.email}
      </p>
    </div>
  );
}
