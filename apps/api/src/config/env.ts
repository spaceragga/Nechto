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

const apiEnvSchema = z.object({
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
    .regex(/^\d+[smhd]$/, 'JWT_EXPIRES_IN must look like 60s, 15m, 12h, or 7d')
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

export const ACCESS_TOKEN_COOKIE = 'nechto_access_token';

const DURATION_MS: Record<'s' | 'm' | 'h' | 'd', number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/** Convert validated JWT_EXPIRES_IN (e.g. 7d) to cookie maxAge milliseconds. */
export function jwtExpiresInToMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    throw new Error(`Invalid JWT_EXPIRES_IN: ${value}`);
  }
  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof DURATION_MS;
  return amount * DURATION_MS[unit];
}

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
