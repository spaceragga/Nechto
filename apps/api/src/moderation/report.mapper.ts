import type { Profile, Report } from '@prisma/client';
import {
  REPORT_REASONS,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
  type ContentReport,
  type ReportReason,
  type ReportStatus,
  type ReportTargetType,
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

function asTargetType(value: string): ReportTargetType {
  return (REPORT_TARGET_TYPES as readonly string[]).includes(value)
    ? (value as ReportTargetType)
    : 'profile';
}

export function toContentReport(row: ReportRecord): ContentReport {
  return {
    id: row.id,
    targetType: asTargetType(row.targetType),
    targetId: row.targetId,
    targetTitle: row.targetTitle,
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
