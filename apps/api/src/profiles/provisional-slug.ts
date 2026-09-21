import { randomBytes } from 'node:crypto';
import { isUniqueConstraintOn } from '../prisma/is-unique-constraint-error';

const SLUG_ATTEMPTS = 8;

/** Random public path until the author picks one. Matches profileSlugSchema. */
export function createProvisionalSlug(): string {
  return `n${randomBytes(5).toString('hex')}`;
}

export async function retryUniqueSlug<T>(
  attempt: () => Promise<T>,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < SLUG_ATTEMPTS; i += 1) {
    try {
      return await attempt();
    } catch (error) {
      lastError = error;
      if (!isUniqueConstraintOn(error, 'slug')) {
        throw error;
      }
    }
  }
  throw lastError;
}
