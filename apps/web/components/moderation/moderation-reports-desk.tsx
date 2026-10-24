'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ProfileReport } from '@nechto/api-contract';
import { StaffDesk } from '@/components/staff/staff-desk';
import { StaffDeskList } from '@/components/staff/staff-desk-list';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Link } from '@/i18n/navigation';
import { resolveReportRequest } from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { profilePath } from '@/lib/work-path';

type ModerationReportsDeskProps = {
  reports: ProfileReport[];
};

export function ModerationReportsDesk({
  reports: initial,
}: ModerationReportsDeskProps) {
  const t = useTranslations('Staff');
  const tReport = useTranslations('Report');
  const tErrors = useTranslations('Errors');
  const [reports, setReports] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = reports.filter((item) => item.status === 'open');
  const resolved = reports.filter((item) => item.status === 'resolved');

  async function resolve(id: string) {
    setPendingId(id);
    setError(null);
    try {
      const updated = await resolveReportRequest(id);
      setReports((current) =>
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
        getSearchText={(item) =>
          `${item.profile.displayName ?? ''} ${item.profile.slug} ${item.email} ${item.reason} ${item.details}`
        }
        empty={t('emptyReports')}
        renderItem={(item) => (
          <ReportRow
            item={item}
            pending={pendingId === item.id}
            reasonLabel={tReport(`reasons.${item.reason}`)}
            contactLabel={t('reportContact')}
            resolveLabel={t('resolveReport')}
            onResolve={() => void resolve(item.id)}
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
        getSearchText={(item) =>
          `${item.profile.displayName ?? ''} ${item.profile.slug} ${item.email} ${item.reason} ${item.details}`
        }
        empty={t('emptyResolvedReports')}
        renderItem={(item) => (
          <ReportRow
            item={item}
            pending={false}
            reasonLabel={tReport(`reasons.${item.reason}`)}
            contactLabel={t('reportContact')}
          />
        )}
      />
    </StaffDesk>
  );
}

type ReportRowProps = {
  item: ProfileReport;
  pending: boolean;
  reasonLabel: string;
  contactLabel: string;
  resolveLabel?: string;
  onResolve?: () => void;
};

function ReportRow({
  item,
  pending,
  reasonLabel,
  contactLabel,
  resolveLabel,
  onResolve,
}: ReportRowProps) {
  const name = item.profile.displayName ?? item.profile.slug;

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 py-3">
      <div className="min-w-0">
        <Link href={profilePath(item.profile.slug)}>{name}</Link>
        <p className="text-sm opacity-70">{reasonLabel}</p>
        {item.details ? (
          <p className="mt-1 max-w-xl text-sm opacity-70">{item.details}</p>
        ) : null}
        <p className="mt-1 text-sm opacity-50">
          {contactLabel}: {item.email}
        </p>
      </div>
      {onResolve && resolveLabel ? (
        <Button type="button" disabled={pending} onClick={onResolve}>
          {resolveLabel}
        </Button>
      ) : null}
    </div>
  );
}
