'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ArticleSummary } from '@nechto/api-contract';
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
    <section className="mt-10 flex flex-col gap-10">
      {error ? <FormError>{error}</FormError> : null}
      <div>
        <h2 className="text-sm tracking-wide opacity-70">{t('journalLive')}</h2>
        {published.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">{t('emptyJournalLive')}</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {published.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3"
              >
                <div>
                  <Link href={articlePath(item.id)}>{item.title}</Link>
                  <p className="text-sm opacity-70">
                    <Link href={profilePath(item.author.slug)}>
                      {item.author.displayName}
                    </Link>
                  </p>
                </div>
                <Button
                  type="button"
                  disabled={pendingId === item.id}
                  onClick={() => void hide(item.id)}
                >
                  {t('hideArticle')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="text-sm tracking-wide opacity-70">
          {t('hiddenArticles')}
        </h2>
        {hidden.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">{t('emptyHiddenArticles')}</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {hidden.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3"
              >
                <div>
                  <p>{item.title}</p>
                  <p className="text-sm opacity-70">
                    {item.author.displayName}
                  </p>
                </div>
                <Button
                  type="button"
                  disabled={pendingId === item.id}
                  onClick={() => void unhide(item.id)}
                >
                  {t('unhideArticle')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
