'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ProjectSummary } from '@nechto/api-contract';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffDeskList } from '@/components/staff/staff-desk-list';
import { StaffThumb } from '@/components/staff/staff-thumb';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { featureChannelRequest, unfeatureChannelRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { profilePath, projectPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type CurationChannelsDeskProps = {
  channels: ProjectSummary[];
  featuredChannel: ProjectSummary | null;
};

export function CurationChannelsDesk({
  channels: initial,
  featuredChannel: initialFeatured,
}: CurationChannelsDeskProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const [channels, setChannels] = useState(initial);
  const [featured, setFeatured] = useState(initialFeatured);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function feature(id: string) {
    setPendingId(id);
    setError(null);
    try {
      const updated = await featureChannelRequest(id);
      setFeatured(updated);
      setChannels((current) =>
        current.map((item) =>
          item.id === id ? updated : { ...item, featuredAt: null },
        ),
      );
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  async function unfeature(id: string) {
    setPendingId(id);
    setError(null);
    try {
      const updated = await unfeatureChannelRequest(id);
      setFeatured(null);
      setChannels((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <StaffDesk
      title={t('channels')}
      lede={t('channelsLede')}
      meta={featured ? featured.title : t('deskAuto')}
    >
      {featured ? (
        <div className="flex items-center gap-3 text-sm">
          <StaffThumb src={featured.coverImageUrl} alt={featured.title} />
          <p className="min-w-0">
            {t('featuredNow')}:{' '}
            <Link
              href={projectPath(featured.author.slug, featured.id)}
              className="text-[var(--accent)]"
            >
              {featured.title}
            </Link>
          </p>
        </div>
      ) : (
        <p className="text-sm opacity-70">{t('featuredNoneAuto')}</p>
      )}
      {error ? (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      <StaffDeskList
        className="mt-6"
        items={channels}
        keyOf={(channel) => channel.id}
        getSearchText={(channel) =>
          `${channel.title} ${channel.author.displayName} ${channel.author.slug}`
        }
        empty={t('emptyChannels')}
        renderItem={(channel) => (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumb src={channel.coverImageUrl} alt={channel.title} />
              <div className="min-w-0">
                <Link
                  href={projectPath(channel.author.slug, channel.id)}
                  className="font-serif text-lg tracking-wide"
                >
                  {channel.title}
                </Link>
                <p className="mt-1 text-sm opacity-70">
                  <Link href={profilePath(channel.author.slug)}>
                    {channel.author.displayName}
                  </Link>
                  {channel.featuredAt ? ` · ${t('featuredBadge')}` : ''}
                </p>
              </div>
            </div>
            {channel.featuredAt ? (
              <Button
                type="button"
                disabled={pendingId === channel.id}
                onClick={() => void unfeature(channel.id)}
              >
                {t('unfeature')}
              </Button>
            ) : (
              <Button
                type="button"
                disabled={pendingId === channel.id}
                onClick={() => void feature(channel.id)}
              >
                {t('featureHome')}
              </Button>
            )}
          </div>
        )}
      />
    </StaffDesk>
  );
}
