'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ModerationProfileSummary } from '@nechto/api-contract';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffDeskList } from '@/components/staff/staff-desk-list';
import { StaffThumb } from '@/components/staff/staff-thumb';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { hideProfileRequest, unhideProfileRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { profilePath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type ModerationProfilesDeskProps = {
  liveProfiles: ModerationProfileSummary[];
  hiddenProfiles: ModerationProfileSummary[];
};

export function ModerationProfilesDesk({
  liveProfiles: initialLive,
  hiddenProfiles: initialHidden,
}: ModerationProfilesDeskProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const [live, setLive] = useState(initialLive);
  const [hidden, setHidden] = useState(initialHidden);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function hide(profileId: string) {
    setPendingId(profileId);
    setError(null);
    try {
      const updated = await hideProfileRequest(profileId);
      setLive((current) =>
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
      const updated = await unhideProfileRequest(profileId);
      setHidden((current) =>
        current.filter((item) => item.profileId !== profileId),
      );
      setLive((current) => [updated, ...current]);
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <StaffDesk
      title={t('profilesLive')}
      lede={t('profilesLiveLede')}
      meta={`${live.length} · ${hidden.length}`}
    >
      {error ? <FormError>{error}</FormError> : null}
      <h3 className="text-sm tracking-wide opacity-70">{t('profilesLive')}</h3>
      <StaffDeskList
        className="mt-3"
        items={live}
        keyOf={(item) => item.profileId}
        getSearchText={(item) => `${item.displayName ?? ''} ${item.slug}`}
        empty={t('emptyProfilesLive')}
        renderItem={(item) => (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumb
                src={item.avatarUrl}
                alt={item.displayName ?? item.slug}
              />
              <div className="min-w-0">
                <Link href={profilePath(item.slug)}>
                  {item.displayName ?? item.slug}
                </Link>
                <p className="text-sm opacity-70">{item.slug}</p>
              </div>
            </div>
            <Button
              type="button"
              disabled={pendingId === item.profileId}
              onClick={() => void hide(item.profileId)}
            >
              {t('hideProfile')}
            </Button>
          </div>
        )}
      />
      <h3 className="mt-8 text-sm tracking-wide opacity-70">
        {t('hiddenProfiles')}
      </h3>
      <StaffDeskList
        className="mt-3"
        items={hidden}
        keyOf={(item) => item.profileId}
        getSearchText={(item) => `${item.displayName ?? ''} ${item.slug}`}
        empty={t('emptyHiddenProfiles')}
        renderItem={(item) => (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumb
                src={item.avatarUrl}
                alt={item.displayName ?? item.slug}
              />
              <div className="min-w-0">
                <p>{item.displayName ?? item.slug}</p>
                <p className="text-sm opacity-70">{item.slug}</p>
              </div>
            </div>
            <Button
              type="button"
              disabled={pendingId === item.profileId}
              onClick={() => void unhide(item.profileId)}
            >
              {t('unhideProfile')}
            </Button>
          </div>
        )}
      />
    </StaffDesk>
  );
}
