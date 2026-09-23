import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AdminUsersTable } from '@/components/admin/admin-users-table';
import { StaffScreen } from '@/components/staff/staff-screen';
import type { AppLocale } from '@/i18n/routing';
import { loadStaffResource } from '@/lib/staff-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Staff');
  const result = await loadStaffResource(locale as AppLocale, (api) =>
    api.listAdminUsers(),
  );

  return (
    <StaffScreen
      title={t('adminTitle')}
      lede={t('adminLede')}
      forbidden={t('forbidden')}
      allowed={result.ok}
    >
      <AdminUsersTable initial={result.ok ? result.data.items : []} />
    </StaffScreen>
  );
}
