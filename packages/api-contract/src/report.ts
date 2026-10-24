import { z } from 'zod';
import { profileSlugSchema } from './directions';

export const REPORT_REASONS = [
  'spam',
  'impersonation',
  'harassment',
  'copyright',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const reportReasonSchema = z.enum(REPORT_REASONS);

export const REPORT_STATUSES = ['open', 'resolved'] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const createReportSchema = z.object({
  slug: profileSlugSchema,
  reason: reportReasonSchema,
  details: z.string().trim().max(2000).optional().default(''),
  email: z
    .union([z.string().trim().email().max(128), z.literal('')])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
});

export type CreateReportDto = z.infer<typeof createReportSchema>;

export type ProfileReport = {
  id: string;
  reason: ReportReason;
  details: string;
  email: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  profile: {
    slug: string;
    displayName: string | null;
  };
};

export type CreateReportResponse = {
  ok: true;
};
