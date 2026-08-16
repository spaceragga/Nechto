import { z } from 'zod';

export const reportProfileSchema = z.object({
  reason: z.enum(['spam', 'impersonation', 'harassment', 'copyright', 'other']),
  details: z.string().trim().max(2000).nullable().optional(),
  reporterEmail: z.string().trim().email().nullable().optional(),
});

export const REPORT_REASONS = reportProfileSchema.shape.reason.options;

export const reviewReportSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED']),
  suspendProfile: z.boolean().default(false),
  note: z.string().trim().max(1000).nullable().optional(),
});

export type ReportProfileDto = z.infer<typeof reportProfileSchema>;
export type ReviewReportDto = z.infer<typeof reviewReportSchema>;

export type ModerationReport = {
  id: string;
  profileId: string;
  profileSlug: string | null;
  reason: string;
  details: string | null;
  reporterEmail: string | null;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
};
