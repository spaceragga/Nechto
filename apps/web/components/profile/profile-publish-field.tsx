'use client';

import { useTranslations } from 'next-intl';
import type { Profile } from '@nechto/api-contract';
import { EyeGlyph } from '@/components/glyphs/eye-glyph';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Link } from '@/i18n/navigation';
import { profilePath } from '@/lib/work-path';

type ProfilePublishFieldProps = {
  profile: Profile;
  ready: boolean;
  pending: boolean;
  error: string | null;
  onPublish: () => void;
  onUnpublish: () => void;
};

export function ProfilePublishField({
  profile,
  ready,
  pending,
  error,
  onPublish,
  onUnpublish,
}: ProfilePublishFieldProps) {
  const t = useTranslations('Works');
  const published = Boolean(profile.publishedAt);
  const suspended = Boolean(profile.suspendedAt);
  const visible = published && !suspended;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-3" role="status">
        <EyeGlyph open={visible} />
        <span>
          {suspended
            ? t('visibilitySuspended')
            : visible
              ? t('visibilityVisible')
              : t('visibilityHidden')}
        </span>
      </div>
      <p className="text-sm opacity-70">
        {t(visible ? 'publishVisibleHint' : 'publishHiddenHint')}
      </p>
      {error ? <FormError>{error}</FormError> : null}
      {published && profile.slug ? (
        <>
          <Link href={profilePath(profile.slug)} className="text-sm underline">
            {t('viewPublic')}
          </Link>
          <Button type="button" disabled={pending} onClick={onUnpublish}>
            {t('unpublish')}
          </Button>
        </>
      ) : (
        <Button type="button" disabled={pending || !ready} onClick={onPublish}>
          {t('publishProfile')}
        </Button>
      )}
    </section>
  );
}
