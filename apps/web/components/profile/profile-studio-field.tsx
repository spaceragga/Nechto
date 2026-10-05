'use client';

import { useTranslations } from 'next-intl';
import { STUDIO_DESCRIPTION_MAX, STUDIO_TITLE_MAX } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toUploadSrc } from '@/lib/to-upload-src';

type ProfileStudioFieldProps = {
  title: string;
  description: string;
  coverUrl: string | null;
  optIn: boolean;
  ready: boolean;
  uploading: boolean;
  coverInputKey: number;
  saving: boolean;
  error: string | null;
  saved: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onOptInChange: (value: boolean) => void;
  onCoverChange: (files: FileList | null) => void;
};

export function ProfileStudioField({
  title,
  description,
  coverUrl,
  optIn,
  ready,
  uploading,
  coverInputKey,
  saving,
  error,
  saved,
  onTitleChange,
  onDescriptionChange,
  onOptInChange,
  onCoverChange,
}: ProfileStudioFieldProps) {
  const t = useTranslations('Profile');
  const previewSrc = toUploadSrc(coverUrl);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="font-serif text-3xl tracking-wide">
          {t('studioTitle')}
        </h1>
        <p className="mt-2 text-sm opacity-70">{t('studioLede')}</p>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span>{t('studioName')}</span>
        <Input
          name="studioTitle"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={STUDIO_TITLE_MAX}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span>{t('studioDescription')}</span>
        <Textarea
          name="studioDescription"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          maxLength={STUDIO_DESCRIPTION_MAX}
          rows={4}
        />
      </label>

      <div className="flex flex-col gap-3">
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote upload URL from API
          <img
            src={previewSrc}
            alt={t('studioCoverAlt')}
            className="aspect-4/5 w-40 object-cover"
          />
        ) : (
          <div className="flex aspect-4/5 w-40 items-center justify-center border border-white/20 text-xs opacity-60">
            {t('studioNoCover')}
          </div>
        )}
        <label className="flex flex-col gap-2 text-sm">
          <span>{t('studioCover')}</span>
          <input
            key={coverInputKey}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(event) => onCoverChange(event.target.files)}
          />
        </label>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="studioOptIn"
          checked={optIn}
          disabled={!ready && !optIn}
          onChange={(event) => onOptInChange(event.target.checked)}
          className="mt-1"
        />
        <span>
          {t('studioOptIn')}
          {!ready ? (
            <span className="mt-1 block opacity-70">
              {t('studioOptInHint')}
            </span>
          ) : null}
        </span>
      </label>

      {error ? <FormError>{error}</FormError> : null}
      {saved ? (
        <p className="text-sm opacity-70" role="status">
          {t('saved')}
        </p>
      ) : null}

      <Button type="submit" disabled={saving}>
        {saving ? t('saving') : t('save')}
      </Button>
    </section>
  );
}
