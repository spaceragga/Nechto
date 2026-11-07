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

export const REPORT_TARGET_TYPES = [
  'profile',
  'work',
  'project',
  'article',
  'dialogue',
] as const;

export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const reportTargetTypeSchema = z.enum(REPORT_TARGET_TYPES);

const reportContactFields = {
  reason: reportReasonSchema,
  details: z.string().trim().max(2000).optional().default(''),
  email: z
    .union([z.string().trim().email().max(128), z.literal('')])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
};

export const createReportSchema = z.discriminatedUnion('targetType', [
  z.object({
    targetType: z.literal('profile'),
    slug: profileSlugSchema,
    ...reportContactFields,
  }),
  z.object({
    targetType: z.literal('work'),
    targetId: z.string().cuid(),
    ...reportContactFields,
  }),
  z.object({
    targetType: z.literal('project'),
    targetId: z.string().cuid(),
    ...reportContactFields,
  }),
  z.object({
    targetType: z.literal('article'),
    targetId: z.string().cuid(),
    ...reportContactFields,
  }),
  z.object({
    targetType: z.literal('dialogue'),
    targetId: z.string().cuid(),
    ...reportContactFields,
  }),
]);

export type CreateReportDto = z.infer<typeof createReportSchema>;

export type ContentReport = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
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
