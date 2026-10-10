'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { WorkWithAuthor } from '@nechto/api-contract';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffDeskList } from '@/components/staff/staff-desk-list';
import { StaffThumb } from '@/components/staff/staff-thumb';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { hideWorkRequest, unhideWorkRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { profilePath, workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type ModerationWorksDeskProps = {
  liveWorks: WorkWithAuthor[];
  hiddenWorks: WorkWithAuthor[];
};

export function ModerationWorksDesk({
  liveWorks: initialLive,
  hiddenWorks: initialHidden,
}: ModerationWorksDeskProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const [live, setLive] = useState(initialLive);
  const [hidden, setHidden] = useState(initialHidden);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function hide(id: string) {
    setPendingId(id);
    setError(null);
    try {
      const updated = await hideWorkRequest(id);
      setLive((current) => current.filter((item) => item.id !== id));
      setHidden((current) => [
        updated,
        ...current.filter((item) => item.id !== id),
      ]);
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  async function unhide(id: string) {
    setPendingId(id);
    setError(null);
    try {
      const updated = await unhideWorkRequest(id);
      setHidden((current) => current.filter((item) => item.id !== id));
      setLive((current) => [updated, ...current]);
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <StaffDesk
      title={t('worksLive')}
      lede={t('worksLiveLede')}
      meta={`${live.length} · ${hidden.length}`}
    >
      {error ? <FormError>{error}</FormError> : null}
      <h3 className="text-sm tracking-wide opacity-70">{t('worksLive')}</h3>
      <StaffDeskList
        className="mt-3"
        items={live}
        keyOf={(item) => item.id}
        getSearchText={(item) =>
          `${item.title} ${item.author.displayName} ${item.author.slug}`
        }
        empty={t('emptyWorksLive')}
        renderItem={(item) => (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumb src={item.imageUrl} alt={item.title} />
              <div className="min-w-0">
                <Link href={workPath(item.author.slug, item.id)}>
                  {item.title}
                </Link>
                <p className="text-sm opacity-70">
                  <Link href={profilePath(item.author.slug)}>
                    {item.author.displayName}
                  </Link>
                </p>
              </div>
            </div>
            <Button
              type="button"
              disabled={pendingId === item.id}
              onClick={() => void hide(item.id)}
            >
              {t('hideWork')}
            </Button>
          </div>
        )}
      />
      <h3 className="mt-8 text-sm tracking-wide opacity-70">
        {t('hiddenWorks')}
      </h3>
      <StaffDeskList
        className="mt-3"
        items={hidden}
        keyOf={(item) => item.id}
        getSearchText={(item) =>
          `${item.title} ${item.author.displayName} ${item.author.slug}`
        }
        empty={t('emptyHidden')}
        renderItem={(item) => (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumb src={item.imageUrl} alt={item.title} />
              <div className="min-w-0">
                <p>{item.title}</p>
                <p className="text-sm opacity-70">{item.author.displayName}</p>
              </div>
            </div>
            <Button
              type="button"
              disabled={pendingId === item.id}
              onClick={() => void unhide(item.id)}
            >
              {t('unhideWork')}
            </Button>
          </div>
        )}
      />
    </StaffDesk>
  );
}
