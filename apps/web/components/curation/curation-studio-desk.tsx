'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { StudioProfileSummary } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import {
  featureStudioProfileRequest,
  listStudioProfileRequest,
  unfeatureStudioProfileRequest,
  unlistStudioProfileRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { profilePath, studioPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type CurationStudioDeskProps = {
  listed: StudioProfileSummary[];
  candidates: StudioProfileSummary[];
  featuredStudio: StudioProfileSummary | null;
};

function replaceProfile(
  list: StudioProfileSummary[],
  updated: StudioProfileSummary,
): StudioProfileSummary[] {
  return list.map((item) =>
    item.profileId === updated.profileId ? updated : item,
  );
}

export function CurationStudioDesk({
  listed: initialListed,
  candidates: initialCandidates,
  featuredStudio: initialFeatured,
}: CurationStudioDeskProps) {
  const t = useTranslations('Staff');
  const tProfile = useTranslations('PublicProfile');
  const tErrors = useTranslations('Errors');
  const [listed, setListed] = useState(initialListed);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [featured, setFeatured] = useState(initialFeatured);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(profileId: string, action: () => Promise<void>) {
    setPendingId(profileId);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  async function listProfile(profileId: string) {
    await run(profileId, async () => {
      const updated = await listStudioProfileRequest(profileId);
      setCandidates((current) =>
        current.filter((item) => item.profileId !== profileId),
      );
      setListed((current) => [
        updated,
        ...current.filter((item) => item.profileId !== profileId),
      ]);
    });
  }

  async function unlistProfile(profileId: string) {
    await run(profileId, async () => {
      const updated = await unlistStudioProfileRequest(profileId);
      setListed((current) =>
        current.filter((item) => item.profileId !== profileId),
      );
      setCandidates((current) => [
        updated,
        ...current.filter((item) => item.profileId !== profileId),
      ]);
      if (featured?.profileId === profileId) {
        setFeatured(null);
      }
    });
  }

  async function featureProfile(profileId: string) {
    await run(profileId, async () => {
      const updated = await featureStudioProfileRequest(profileId);
      setFeatured(updated);
      setListed((current) => replaceProfile(current, updated));
    });
  }

  async function unfeatureProfile(profileId: string) {
    await run(profileId, async () => {
      const updated = await unfeatureStudioProfileRequest(profileId);
      setFeatured(null);
      setListed((current) => replaceProfile(current, updated));
    });
  }

  function renderDirections(profile: StudioProfileSummary) {
    const themes =
      profile.themes.length > 0 ? profile.themes : profile.directions;
    return themes
      .map((direction) => tProfile(`directions.${direction}`))
      .join(' · ');
  }

  return (
    <section className="mt-10">
      <h2 className="text-sm tracking-wide opacity-70">{t('studio')}</h2>
      <p className="mt-2 max-w-2xl text-sm opacity-70">{t('studioLede')}</p>
      {featured ? (
        <p className="mt-4 text-sm">
          {t('featuredStudioNow')}:{' '}
          <Link
            href={studioPath(featured.slug)}
            className="text-[var(--accent)]"
          >
            {featured.displayName}
          </Link>
        </p>
      ) : (
        <p className="mt-4 text-sm opacity-70">{t('featuredStudioNone')}</p>
      )}
      {error ? (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}

      <h3 className="mt-8 text-sm tracking-wide opacity-70">
        {t('studioListed')}
      </h3>
      {listed.length === 0 ? (
        <p className="mt-3 text-sm opacity-70">{t('emptyStudioListed')}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {listed.map((profile) => (
            <li
              key={profile.profileId}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3"
            >
              <div className="min-w-0">
                <Link
                  href={studioPath(profile.slug)}
                  className="font-serif text-lg tracking-wide"
                >
                  {profile.displayName}
                </Link>
                <p className="mt-1 text-sm opacity-70">
                  {renderDirections(profile)}
                  {profile.studioFeaturedAt ? ` · ${t('featuredBadge')}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.studioFeaturedAt ? (
                  <Button
                    type="button"
                    disabled={pendingId === profile.profileId}
                    onClick={() => void unfeatureProfile(profile.profileId)}
                  >
                    {t('unfeature')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={pendingId === profile.profileId}
                    onClick={() => void featureProfile(profile.profileId)}
                  >
                    {t('featureHome')}
                  </Button>
                )}
                <Button
                  type="button"
                  disabled={pendingId === profile.profileId}
                  onClick={() => void unlistProfile(profile.profileId)}
                >
                  {t('studioUnlist')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-10 text-sm tracking-wide opacity-70">
        {t('studioCandidates')}
      </h3>
      {candidates.length === 0 ? (
        <p className="mt-3 text-sm opacity-70">{t('emptyStudioCandidates')}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {candidates.map((profile) => (
            <li
              key={profile.profileId}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3"
            >
              <div className="min-w-0">
                <Link
                  href={profilePath(profile.slug)}
                  className="font-serif text-lg tracking-wide"
                >
                  {profile.displayName}
                </Link>
                <p className="mt-1 text-sm opacity-70">
                  {renderDirections(profile)}
                </p>
              </div>
              <Button
                type="button"
                disabled={pendingId === profile.profileId}
                onClick={() => void listProfile(profile.profileId)}
              >
                {t('studioList')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
