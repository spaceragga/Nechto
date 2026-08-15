import { z } from 'zod';

const webEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_API_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_API_URL is required')
    .url({ message: 'NEXT_PUBLIC_API_URL must be a valid URL' }),
});

const parsed = webEnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid web environment variables:\n${details}`);
}

export const env = parsed.data;
