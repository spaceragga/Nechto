'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ArticleSummary } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { featureArticleRequest, unfeatureArticleRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { articlePath, profilePath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type CurationJournalDeskProps = {
  issues: ArticleSummary[];
  featuredArticle: ArticleSummary | null;
};

export function CurationJournalDesk({
  issues: initial,
  featuredArticle: initialFeatured,
}: CurationJournalDeskProps) {
  const t = useTranslations('Staff');
  const tErrors = useTranslations('Errors');
  const [issues, setIssues] = useState(initial);
  const [featured, setFeatured] = useState(initialFeatured);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function feature(id: string) {
    setPendingId(id);
    setError(null);
    try {
      const updated = await featureArticleRequest(id);
      setFeatured(updated);
      setIssues((current) =>
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
      const updated = await unfeatureArticleRequest(id);
      setFeatured(null);
      setIssues((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-sm tracking-wide opacity-70">{t('issues')}</h2>
      <p className="mt-2 max-w-2xl text-sm opacity-70">{t('issuesLede')}</p>
      {featured ? (
        <p className="mt-4 text-sm">
          {t('featuredNow')}:{' '}
          <Link
            href={articlePath(featured.id)}
            className="text-[var(--accent)]"
          >
            {featured.title}
          </Link>
        </p>
      ) : (
        <p className="mt-4 text-sm opacity-70">{t('featuredNone')}</p>
      )}
      {error ? (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      {issues.length === 0 ? (
        <p className="mt-6 text-sm opacity-70">{t('emptyCuration')}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {issues.map((issue) => (
            <li
              key={issue.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3"
            >
              <div className="min-w-0">
                <Link
                  href={articlePath(issue.id)}
                  className="font-serif text-lg tracking-wide"
                >
                  {issue.title}
                </Link>
                <p className="mt-1 text-sm opacity-70">
                  <Link href={profilePath(issue.author.slug)}>
                    {issue.author.displayName}
                  </Link>
                  {issue.featuredAt ? ` · ${t('featuredBadge')}` : ''}
                </p>
              </div>
              {issue.featuredAt ? (
                <Button
                  type="button"
                  disabled={pendingId === issue.id}
                  onClick={() => void unfeature(issue.id)}
                >
                  {t('unfeature')}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={pendingId === issue.id}
                  onClick={() => void feature(issue.id)}
                >
                  {t('featureHome')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
