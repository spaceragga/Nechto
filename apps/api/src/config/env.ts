import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

const envFileCandidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
];

for (const envFilePath of envFileCandidates) {
  if (existsSync(envFilePath)) {
    loadDotenv({ path: envFilePath });
    break;
  }
}

const apiEnvSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required')
      .refine(
        (value) =>
          value.startsWith('postgresql://') || value.startsWith('postgres://'),
        'DATABASE_URL must be a PostgreSQL connection string',
      ),
    CORS_ORIGIN: z.string().optional(),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
    JWT_EXPIRES_IN: z
      .string()
      .regex(
        /^\d+[smhd]$/,
        'JWT_EXPIRES_IN must look like 60s, 15m, 12h, or 7d',
      )
      .default('7d'),
    COOKIE_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    STORAGE_DRIVER: z.enum(['local']).default('local'),
    STORAGE_LOCAL_ROOT: z.string().min(1).default('uploads'),
    STORAGE_PUBLIC_BASE_URL: z
      .string()
      .url({ message: 'STORAGE_PUBLIC_BASE_URL must be a valid URL' })
      .default('http://localhost:3001/uploads'),
    WEB_PUBLIC_URL: z.string().url().default('http://localhost:3000'),
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASSWORD: z.string().min(1).optional(),
    SMTP_FROM: z.string().email().optional(),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV !== 'production') {
      return;
    }
    if (!value.CORS_ORIGIN) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGIN'],
        message: 'CORS_ORIGIN is required in production',
      });
    }
    if (!value.COOKIE_SECURE) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COOKIE_SECURE'],
        message: 'COOKIE_SECURE must be true in production',
      });
    }
    if (value.JWT_SECRET.length < 32) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must be at least 32 characters in production',
      });
    }
    for (const field of [
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASSWORD',
      'SMTP_FROM',
    ] as const) {
      if (!value[field]) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: `${field} is required for production email delivery`,
        });
      }
    }
  });

const parsed = apiEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid API environment variables:\n${details}`);
}

export const env = parsed.data;
export type ApiEnv = z.infer<typeof apiEnvSchema>;

export { ACCESS_TOKEN_COOKIE } from '@nechto/api-contract';
export { jwtExpiresInToMs } from './jwt-expires';
export { AVATAR_ALLOWED_MIME_TYPES, AVATAR_MAX_BYTES } from './avatar-limits';
