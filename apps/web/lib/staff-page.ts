import { ApiError } from '@nechto/api-client';
import type { ApiClient } from '@nechto/api-client';
import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { createServerApiClient } from '@/lib/api-server';

export type StaffLoadResult<T> =
  { ok: true; data: T } | { ok: false; status: 403 };

export async function loadStaffResource<T>(
  locale: AppLocale,
  load: (api: ApiClient) => Promise<T>,
): Promise<StaffLoadResult<T>> {
  try {
    const api = await createServerApiClient();
    return { ok: true, data: await load(api) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect({ href: '/login', locale });
    }
    if (error instanceof ApiError && error.status === 403) {
      return { ok: false, status: 403 };
    }
    throw error;
  }
}
