'use client';

import { useTranslations } from 'next-intl';
import { StaffDesk } from '@/components/staff/staff-desk';

export function ModerationReportsDesk() {
  const t = useTranslations('Staff');

  return (
    <StaffDesk title={t('reports')} meta={t('deskEmpty')}>
      <p className="text-sm opacity-70">{t('emptyReports')}</p>
    </StaffDesk>
  );
}
