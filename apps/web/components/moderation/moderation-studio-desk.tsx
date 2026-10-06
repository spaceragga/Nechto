'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { StudioProfileSummary } from '@nechto/api-contract';
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
    <section className="mt-10 flex flex-col gap-10">
      {error ? <FormError>{error}</FormError> : null}
      <div>
        <h2 className="text-sm tracking-wide opacity-70">{t('studioLive')}</h2>
        <p className="mt-2 max-w-2xl text-sm opacity-70">
          {t('studioLiveLede')}
        </p>
        {published.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">{t('emptyStudioLive')}</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {published.map((profile) => (
              <li
                key={profile.profileId}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3"
              >
                <div>
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
                <Button
                  type="button"
                  disabled={pendingId === profile.profileId}
                  onClick={() => void hide(profile.profileId)}
                >
                  {t('hideStudio')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="text-sm tracking-wide opacity-70">
          {t('studioHidden')}
        </h2>
        {hidden.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">{t('emptyStudioHidden')}</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {hidden.map((profile) => (
              <li
                key={profile.profileId}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3"
              >
                <div>
                  <Link href={profilePath(profile.slug)}>
                    {profile.displayName}
                  </Link>
                  <p className="text-sm opacity-70">
                    {renderDirections(profile)}
                  </p>
                </div>
                <Button
                  type="button"
                  disabled={pendingId === profile.profileId}
                  onClick={() => void unhide(profile.profileId)}
                >
                  {t('unhideStudio')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
