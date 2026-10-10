'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ArticleSummary } from '@nechto/api-contract';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffDeskList } from '@/components/staff/staff-desk-list';
import { StaffThumb } from '@/components/staff/staff-thumb';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { hideArticleRequest, unhideArticleRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { articlePath, profilePath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type ModerationArticlesDeskProps = {
  published: ArticleSummary[];
  hiddenArticles: ArticleSummary[];
};

export function ModerationArticlesDesk({
  published: initialPublished,
  hiddenArticles: initialHidden,
}: ModerationArticlesDeskProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const [published, setPublished] = useState(initialPublished);
  const [hidden, setHidden] = useState(initialHidden);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function hide(id: string) {
    setPendingId(id);
    setError(null);
    try {
      const updated = await hideArticleRequest(id);
      setPublished((current) => current.filter((item) => item.id !== id));
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
      const updated = await unhideArticleRequest(id);
      setHidden((current) => current.filter((item) => item.id !== id));
      setPublished((current) => [updated, ...current]);
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <StaffDesk
      title={t('journalLive')}
      meta={`${published.length} · ${hidden.length}`}
    >
      {error ? <FormError>{error}</FormError> : null}
      <h3 className="text-sm tracking-wide opacity-70">{t('journalLive')}</h3>
      <StaffDeskList
        className="mt-3"
        items={published}
        keyOf={(item) => item.id}
        getSearchText={(item) =>
          `${item.title} ${item.author.displayName} ${item.author.slug}`
        }
        empty={t('emptyJournalLive')}
        renderItem={(item) => (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumb src={item.coverImageUrl} alt={item.title} />
              <div className="min-w-0">
                <Link href={articlePath(item.id)}>{item.title}</Link>
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
              {t('hideArticle')}
            </Button>
          </div>
        )}
      />
      <h3 className="mt-8 text-sm tracking-wide opacity-70">
        {t('hiddenArticles')}
      </h3>
      <StaffDeskList
        className="mt-3"
        items={hidden}
        keyOf={(item) => item.id}
        getSearchText={(item) =>
          `${item.title} ${item.author.displayName} ${item.author.slug}`
        }
        empty={t('emptyHiddenArticles')}
        renderItem={(item) => (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <StaffThumb src={item.coverImageUrl} alt={item.title} />
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
              {t('unhideArticle')}
            </Button>
          </div>
        )}
      />
    </StaffDesk>
  );
}
