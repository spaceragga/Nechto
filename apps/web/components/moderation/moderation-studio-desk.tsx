'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { StudioProfileSummary } from '@nechto/api-contract';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffDeskList } from '@/components/staff/staff-desk-list';
import { StaffThumb } from '@/components/staff/staff-thumb';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import {
  hideStudioProfileRequest,
  unhideStudioProfileRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { profilePath, studioPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type ModerationStudioDeskProps = {
  published: StudioProfileSummary[];
  hiddenStudio: StudioProfileSummary[];
};

export function ModerationStudioDesk({
  published: initialPublished,
  hiddenStudio: initialHidden,
}: ModerationStudioDeskProps) {
  const t = useTranslations('Staff');
  const tProfile = useTranslations('PublicProfile');
  const tErrors = useTranslations('Errors');
  const [published, setPublished] = useState(initialPublished);
  const [hidden, setHidden] = useState(initialHidden);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function hide(profileId: string) {
    setPendingId(profileId);
    setError(null);
    try {
      const updated = await hideStudioProfileRequest(profileId);
      setPublished((current) =>
        current.filter((item) => item.profileId !== profileId),
      );
      setHidden((current) => [
        updated,
        ...current.filter((item) => item.profileId !== profileId),
      ]);
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  async function unhide(profileId: string) {
    setPendingId(profileId);
    setError(null);
    try {
      const updated = await unhideStudioProfileRequest(profileId);
      setHidden((current) =>
        current.filter((item) => item.profileId !== profileId),
      );
      setPublished((current) => [
        updated,
        ...current.filter((item) => item.profileId !== profileId),
      ]);
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  function renderDirections(profile: StudioProfileSummary) {
    const themes =
      profile.themes.length > 0 ? profile.themes : profile.directions;
    return themes
      .map((direction) => tProfile(`directions.${direction}`))
      .join(' · ');
  }

  return (
    <StaffDesk
      title={t('studioLive')}
      lede={t('studioLiveLede')}
      meta={`${published.length} · ${hidden.length}`}
    >
      {error ? <FormError>{error}</FormError> : null}
      <h3 className="text-sm tracking-wide opacity-70">{t('studioLive')}</h3>
      <StaffDeskList
        className="mt-3"
        items={published}
        keyOf={(profile) => profile.profileId}
        getSearchText={(profile) =>
          `${profile.displayName} ${profile.slug} ${renderDirections(profile)}`
        }
        empty={t('emptyStudioLive')}
        renderItem={(profile) => (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumb
                src={profile.coverUrl ?? profile.avatarUrl}
                alt={profile.displayName}
              />
              <div className="min-w-0">
                <Link
                  href={studioPath(profile.slug)}
                  className="font-serif text-lg tracking-wide"
                >
                  {profile.displayName}
                </Link>
                <p className="text-sm opacity-70">
                  {renderDirections(profile)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              disabled={pendingId === profile.profileId}
              onClick={() => void hide(profile.profileId)}
            >
              {t('hideStudio')}
            </Button>
          </div>
        )}
      />
      <h3 className="mt-8 text-sm tracking-wide opacity-70">
        {t('studioHidden')}
      </h3>
      <StaffDeskList
        className="mt-3"
        items={hidden}
        keyOf={(profile) => profile.profileId}
        getSearchText={(profile) =>
          `${profile.displayName} ${profile.slug} ${renderDirections(profile)}`
        }
        empty={t('emptyStudioHidden')}
        renderItem={(profile) => (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumb
                src={profile.coverUrl ?? profile.avatarUrl}
                alt={profile.displayName}
              />
              <div className="min-w-0">
                <Link href={profilePath(profile.slug)}>
                  {profile.displayName}
                </Link>
                <p className="text-sm opacity-70">
                  {renderDirections(profile)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              disabled={pendingId === profile.profileId}
              onClick={() => void unhide(profile.profileId)}
            >
              {t('unhideStudio')}
            </Button>
          </div>
        )}
      />
    </StaffDesk>
  );
}
