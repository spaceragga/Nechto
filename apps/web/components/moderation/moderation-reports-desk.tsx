'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ContentReport, ReportTargetType } from '@nechto/api-contract';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffDeskList } from '@/components/staff/staff-desk-list';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Link } from '@/i18n/navigation';
import {
  hideArticleRequest,
  hideDialogueRequest,
  hideWorkRequest,
  resolveReportRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import {
  articlePath,
  dialoguePath,
  profilePath,
  projectPath,
  workPath,
} from '@/lib/work-path';

type ModerationReportsDeskProps = {
  reports: ContentReport[];
};

function targetHref(item: ContentReport): string {
  const slug = item.profile.slug;
  switch (item.targetType) {
    case 'profile':
      return profilePath(slug);
    case 'work':
      return workPath(slug, item.targetId);
    case 'project':
      return projectPath(slug, item.targetId);
    case 'article':
      return articlePath(item.targetId);
    case 'dialogue':
      return dialoguePath(item.targetId);
  }
}

function canHideTarget(type: ReportTargetType): boolean {
  return type === 'work' || type === 'article' || type === 'dialogue';
}

async function hideTarget(item: ContentReport) {
  switch (item.targetType) {
    case 'work':
      await hideWorkRequest(item.targetId);
      return;
    case 'article':
      await hideArticleRequest(item.targetId);
      return;
    case 'dialogue':
      await hideDialogueRequest(item.targetId);
      return;
    default:
      throw new Error(`Hide is not available for ${item.targetType}`);
  }
}

export function ModerationReportsDesk({
  reports: initial,
}: ModerationReportsDeskProps) {
  const t = useTranslations('Staff');
  const tReport = useTranslations('Report');
  const tErrors = useTranslations('Errors');
  const [reports, setReports] = useState(initial);
  const [hiddenTargets, setHiddenTargets] = useState<Set<string>>(
    () => new Set(),
  );
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = reports.filter((item) => item.status === 'open');
  const resolved = reports.filter((item) => item.status === 'resolved');

  async function resolve(id: string) {
    setPendingKey(`resolve:${id}`);
    setError(null);
    try {
      const updated = await resolveReportRequest(id);
      setReports((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingKey(null);
    }
  }

  async function hide(item: ContentReport) {
    setPendingKey(`hide:${item.id}`);
    setError(null);
    try {
      await hideTarget(item);
      setHiddenTargets((current) => new Set(current).add(item.id));
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPendingKey(null);
    }
  }

  function searchText(item: ContentReport) {
    return `${item.profile.displayName ?? ''} ${item.profile.slug} ${item.targetTitle} ${item.targetType} ${item.email} ${item.reason} ${item.details}`;
  }

  return (
    <StaffDesk
      title={t('reports')}
      lede={t('reportsLede')}
      meta={`${open.length}`}
      defaultOpen={open.length > 0}
    >
      {error ? <FormError>{error}</FormError> : null}
      <h3 className="text-sm tracking-wide opacity-70">{t('openReports')}</h3>
      <StaffDeskList
        className="mt-3"
        items={open}
        keyOf={(item) => item.id}
        getSearchText={searchText}
        empty={t('emptyReports')}
        renderItem={(item) => (
          <ReportRow
            item={item}
            pending={
              pendingKey === `hide:${item.id}` ||
              pendingKey === `resolve:${item.id}`
            }
            targetLabel={tReport(
              `targets.${item.targetType as ReportTargetType}`,
            )}
            reasonLabel={tReport(`reasons.${item.reason}`)}
            contactLabel={t('reportContact')}
            resolveLabel={t('resolveReport')}
            hideLabel={
              canHideTarget(item.targetType) && !hiddenTargets.has(item.id)
                ? t('hideReported')
                : undefined
            }
            hiddenLabel={
              hiddenTargets.has(item.id) ? t('reportedHidden') : undefined
            }
            onResolve={() => void resolve(item.id)}
            onHide={
              canHideTarget(item.targetType) && !hiddenTargets.has(item.id)
                ? () => void hide(item)
                : undefined
            }
          />
        )}
      />
      <h3 className="mt-8 text-sm tracking-wide opacity-70">
        {t('resolvedReports')}
      </h3>
      <StaffDeskList
        className="mt-3"
        items={resolved}
        keyOf={(item) => item.id}
        getSearchText={searchText}
        empty={t('emptyResolvedReports')}
        renderItem={(item) => (
          <ReportRow
            item={item}
            pending={false}
            targetLabel={tReport(
              `targets.${item.targetType as ReportTargetType}`,
            )}
            reasonLabel={tReport(`reasons.${item.reason}`)}
            contactLabel={t('reportContact')}
          />
        )}
      />
    </StaffDesk>
  );
}

type ReportRowProps = {
  item: ContentReport;
  pending: boolean;
  targetLabel: string;
  reasonLabel: string;
  contactLabel: string;
  resolveLabel?: string;
  hideLabel?: string;
  hiddenLabel?: string;
  onResolve?: () => void;
  onHide?: () => void;
};

function ReportRow({
  item,
  pending,
  targetLabel,
  reasonLabel,
  contactLabel,
  resolveLabel,
  hideLabel,
  hiddenLabel,
  onResolve,
  onHide,
}: ReportRowProps) {
  const author = item.profile.displayName ?? item.profile.slug;
  const title = item.targetTitle.trim() || author;

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 py-3">
      <div className="min-w-0">
        <Link
          href={targetHref(item)}
          className="font-serif text-lg tracking-wide"
        >
          {title}
        </Link>
        <p className="mt-1 text-sm opacity-70">
          {targetLabel}
          {' · '}
          <Link href={profilePath(item.profile.slug)}>{author}</Link>
        </p>
        <p className="text-sm opacity-70">{reasonLabel}</p>
        {item.details ? (
          <p className="mt-1 max-w-xl text-sm opacity-70">{item.details}</p>
        ) : null}
        <p className="mt-1 text-sm opacity-50">
          {contactLabel}: {item.email}
        </p>
        {hiddenLabel ? (
          <p className="mt-1 text-sm opacity-70">{hiddenLabel}</p>
        ) : null}
      </div>
      {onResolve || onHide ? (
        <div className="flex flex-wrap gap-2">
          {onHide && hideLabel ? (
            <Button type="button" disabled={pending} onClick={onHide}>
              {hideLabel}
            </Button>
          ) : null}
          {onResolve && resolveLabel ? (
            <Button type="button" disabled={pending} onClick={onResolve}>
              {resolveLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
