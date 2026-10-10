'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { WorkWithAuthor } from '@nechto/api-contract';
import { WorkPicker } from '@/components/curation/work-picker';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffThumb } from '@/components/staff/staff-thumb';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { featureBillboardRequest, unfeatureBillboardRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { profilePath, workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type CurationBillboardDeskProps = {
  featuredBillboard: WorkWithAuthor | null;
};

export function CurationBillboardDesk({
  featuredBillboard: initial,
}: CurationBillboardDeskProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const [featured, setFeatured] = useState(initial);
  const [workId, setWorkId] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function feature() {
    if (!workId) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const updated = await featureBillboardRequest(workId);
      setFeatured(updated);
      setWorkId('');
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPending(false);
    }
  }

  async function unfeature() {
    if (!featured) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await unfeatureBillboardRequest(featured.id);
      setFeatured(null);
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPending(false);
    }
  }

  return (
    <StaffDesk
      title={t('billboard')}
      lede={t('billboardLede')}
      meta={featured ? featured.title : t('deskAuto')}
    >
      {featured ? (
        <div className="flex items-center gap-3 text-sm">
          <StaffThumb src={featured.imageUrl} alt={featured.title} />
          <p className="min-w-0">
            {t('featuredNow')}:{' '}
            <Link
              href={workPath(featured.author.slug, featured.id)}
              className="text-[var(--accent)]"
            >
              {featured.title}
            </Link>
            {' · '}
            <Link href={profilePath(featured.author.slug)}>
              {featured.author.displayName}
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
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <WorkPicker
            label={t('billboardPick')}
            value={workId}
            onChange={setWorkId}
            placeholder={t('pairingPickWork')}
            searchPlaceholder={t('pairingSearchWork')}
            empty={t('pairingNoWorks')}
            clearLabel={t('pairingClearWork')}
          />
        </div>
        <Button
          type="button"
          disabled={pending || !workId}
          onClick={() => void feature()}
        >
          {t('featureHome')}
        </Button>
        {featured ? (
          <Button
            type="button"
            disabled={pending}
            onClick={() => void unfeature()}
          >
            {t('unfeature')}
          </Button>
        ) : null}
      </div>
    </StaffDesk>
  );
}
