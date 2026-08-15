import { createApiClient } from '@nechto/api-client';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

/**
 * ApiClient for RSC / server loaders (do not import from Client Components).
 * Browser `credentials: 'include'` does not apply when Next server-fetches the API,
 * so we forward the incoming request cookies explicitly.
 */
export async function createServerApiClient() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  return createApiClient({
    baseUrl: env.API_INTERNAL_URL,
    credentials: 'omit',
    cache: 'no-store',
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
}
