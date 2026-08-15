import { z } from 'zod';

const webEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  // Server-only: Docker web→api uses the compose service hostname.
  API_INTERNAL_URL: z
    .string()
    .url({ message: 'API_INTERNAL_URL must be a valid URL' })
    .default('http://localhost:3001'),
});

const parsed = webEnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
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
};
