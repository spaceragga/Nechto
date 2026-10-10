'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { PublicProfileWithWorks } from '@nechto/api-contract';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffDeskList } from '@/components/staff/staff-desk-list';
import { StaffThumb } from '@/components/staff/staff-thumb';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import {
  featureHomeCreatorRequest,
  unfeatureHomeCreatorRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { profilePath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type CurationCreatorDeskProps = {
  creators: PublicProfileWithWorks[];
  featuredCreator: PublicProfileWithWorks | null;
};

export function CurationCreatorDesk({
  creators: initial,
  featuredCreator: initialFeatured,
}: CurationCreatorDeskProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const [creators, setCreators] = useState(initial);
  const [featured, setFeatured] = useState(initialFeatured);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function feature(slug: string) {
    setPendingSlug(slug);
    setError(null);
    try {
      const updated = await featureHomeCreatorRequest(slug);
      setFeatured(updated);
      setCreators((current) =>
        current.map((item) =>
          item.slug === slug ? updated : { ...item, homeFeaturedAt: null },
        ),
      );
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingSlug(null);
    }
  }

  async function unfeature(slug: string) {
    setPendingSlug(slug);
    setError(null);
    try {
      const updated = await unfeatureHomeCreatorRequest(slug);
      setFeatured(null);
      setCreators((current) =>
        current.map((item) => (item.slug === slug ? updated : item)),
      );
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingSlug(null);
    }
  }

  const withSlug = creators.filter(
    (creator): creator is PublicProfileWithWorks & { slug: string } =>
      Boolean(creator.slug),
  );

  return (
    <StaffDesk
      title={t('creatorWeek')}
      lede={t('creatorWeekLede')}
      meta={
        featured?.slug ? (featured.displayName ?? featured.slug) : t('deskAuto')
      }
    >
      {featured?.slug ? (
        <div className="flex items-center gap-3 text-sm">
          <StaffThumb
            src={featured.avatarUrl}
            alt={featured.displayName ?? featured.slug}
          />
          <p className="min-w-0">
            {t('featuredNow')}:{' '}
            <Link
              href={profilePath(featured.slug)}
              className="text-[var(--accent)]"
            >
              {featured.displayName ?? featured.slug}
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
        items={withSlug}
        keyOf={(creator) => creator.slug}
        getSearchText={(creator) =>
          `${creator.displayName ?? ''} ${creator.slug}`
        }
        empty={t('emptyCreatorsCuration')}
        renderItem={(creator) => (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumb
                src={creator.avatarUrl}
                alt={creator.displayName ?? creator.slug}
              />
              <div className="min-w-0">
                <Link
                  href={profilePath(creator.slug)}
                  className="font-serif text-lg tracking-wide"
                >
                  {creator.displayName ?? creator.slug}
                </Link>
                <p className="mt-1 text-sm opacity-70">
                  {creator.homeFeaturedAt ? t('featuredBadge') : creator.slug}
                </p>
              </div>
            </div>
            {creator.homeFeaturedAt ? (
              <Button
                type="button"
                disabled={pendingSlug === creator.slug}
                onClick={() => void unfeature(creator.slug)}
              >
                {t('unfeature')}
              </Button>
            ) : (
              <Button
                type="button"
                disabled={pendingSlug === creator.slug}
                onClick={() => void feature(creator.slug)}
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
