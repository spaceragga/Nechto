'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { HOME_HANGING_MAX, type WorkWithAuthor } from '@nechto/api-contract';
import { WorkPicker } from '@/components/curation/work-picker';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffDeskList } from '@/components/staff/staff-desk-list';
import { StaffThumb } from '@/components/staff/staff-thumb';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { hangWorkRequest, unhangWorkRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { profilePath, workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type CurationHangingsDeskProps = {
  hangings: WorkWithAuthor[];
};

export function CurationHangingsDesk({
  hangings: initial,
}: CurationHangingsDeskProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const [hangings, setHangings] = useState(initial);
  const [workId, setWorkId] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function hang() {
    if (!workId) {
      return;
    }
    setPendingId(workId);
    setError(null);
    try {
      const updated = await hangWorkRequest(workId);
      setHangings((current) => [
        updated,
        ...current.filter((item) => item.id !== updated.id),
      ]);
      setWorkId('');
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  async function unhang(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await unhangWorkRequest(id);
      setHangings((current) => current.filter((item) => item.id !== id));
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <StaffDesk
      title={t('hangings')}
      lede={t('hangingsLede', { max: HOME_HANGING_MAX })}
      meta={
        hangings.length > 0
          ? `${hangings.length}/${HOME_HANGING_MAX}`
          : t('deskAuto')
      }
    >
      {error ? (
        <div className="mb-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <WorkPicker
            label={t('hangingsPick')}
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
          disabled={
            pendingId !== null || !workId || hangings.length >= HOME_HANGING_MAX
          }
          onClick={() => void hang()}
        >
          {t('hangAdd')}
        </Button>
      </div>
      <StaffDeskList
        className="mt-6"
        items={hangings}
        keyOf={(work) => work.id}
        getSearchText={(work) =>
          `${work.title} ${work.author.displayName} ${work.author.slug}`
        }
        empty={t('emptyHangings')}
        renderItem={(work) => (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumb src={work.imageUrl} alt={work.title} />
              <div className="min-w-0">
                <Link
                  href={workPath(work.author.slug, work.id)}
                  className="font-serif text-lg tracking-wide"
                >
                  {work.title}
                </Link>
                <p className="mt-1 text-sm opacity-70">
                  <Link href={profilePath(work.author.slug)}>
                    {work.author.displayName}
                  </Link>
                </p>
              </div>
            </div>
            <Button
              type="button"
              disabled={pendingId === work.id}
              onClick={() => void unhang(work.id)}
            >
              {t('hangRemove')}
            </Button>
          </div>
        )}
      />
    </StaffDesk>
  );
}
