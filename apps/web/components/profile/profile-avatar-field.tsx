'use client';

import { useTranslations } from 'next-intl';
import { toUploadSrc } from '@/lib/to-upload-src';

type ProfileAvatarFieldProps = {
  avatarUrl: string | null;
  uploading: boolean;
  fileInputKey: number;
  onFileChange: (files: FileList | null) => void;
};

export function ProfileAvatarField({
  avatarUrl,
  uploading,
  fileInputKey,
  onFileChange,
}: ProfileAvatarFieldProps) {
  const t = useTranslations('Profile');

  const previewSrc = toUploadSrc(avatarUrl);

  return (
    <div className="flex flex-col items-start gap-3">
      {previewSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote upload URL from API
        <img
          src={previewSrc}
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
          key={fileInputKey}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={(event) => onFileChange(event.target.files)}
        />
      </label>
      {uploading ? (
        <p className="text-sm opacity-70">{t('uploading')}</p>
      ) : null}
    </div>
  );
}
