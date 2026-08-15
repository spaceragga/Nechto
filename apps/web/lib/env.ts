import { z } from 'zod';

const webEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_API_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_API_URL is required')
    .url({ message: 'NEXT_PUBLIC_API_URL must be a valid URL' }),
  // Server-only: Docker web→api uses the compose service hostname.
  API_INTERNAL_URL: z
    .string()
    .url({ message: 'API_INTERNAL_URL must be a valid URL' })
    .optional(),
});

const parsed = webEnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_INTERNAL_URL: process.env.API_INTERNAL_URL,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid web environment variables:\n${details}`);
}

export const env = {
  ...parsed.data,
  API_INTERNAL_URL:
    parsed.data.API_INTERNAL_URL ?? parsed.data.NEXT_PUBLIC_API_URL,
};
