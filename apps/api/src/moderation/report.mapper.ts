import type { Profile, Report } from '@prisma/client';
import {
  REPORT_REASONS,
  REPORT_STATUSES,
  type ProfileReport,
  type ReportReason,
  type ReportStatus,
} from '@nechto/api-contract';

type ReportRecord = Report & {
  profile: Pick<Profile, 'slug' | 'displayName'>;
};

function asReason(value: string): ReportReason {
  return (REPORT_REASONS as readonly string[]).includes(value)
    ? (value as ReportReason)
    : 'other';
}

function asStatus(value: string): ReportStatus {
  return (REPORT_STATUSES as readonly string[]).includes(value)
    ? (value as ReportStatus)
    : 'open';
}

export function toProfileReport(row: ReportRecord): ProfileReport {
  return {
    id: row.id,
    reason: asReason(row.reason),
    details: row.details,
    email: row.email,
    status: asStatus(row.status),
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    profile: {
      slug: row.profile.slug ?? '',
      displayName: row.profile.displayName,
    },
  };
}
