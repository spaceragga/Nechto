'use client';

import { useTranslations } from 'next-intl';

type ProfileAvatarFieldProps = {
  avatarUrl: string | null;
  uploading: boolean;
  onFileChange: (files: FileList | null) => void;
};

export function ProfileAvatarField({
  avatarUrl,
  uploading,
  onFileChange,
}: ProfileAvatarFieldProps) {
  const t = useTranslations('Profile');

  return (
    <div className="flex flex-col items-start gap-3">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote upload URL from API
        <img
          src={avatarUrl}
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
          onChange={(event) => onFileChange(event.target.files)}
        />
      </label>
      {uploading ? (
        <p className="text-sm opacity-70">{t('uploading')}</p>
      ) : null}
    </div>
  );
}
