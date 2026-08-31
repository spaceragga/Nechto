'use client';

import { useTranslations } from 'next-intl';
import type { Profile } from '@nechto/api-contract';
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

  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm opacity-70">{t('publishHint')}</p>
      {error ? <FormError>{error}</FormError> : null}
      {published && profile.slug ? (
        <>
          <p className="text-sm" role="status">
            {t('published')}
          </p>
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
