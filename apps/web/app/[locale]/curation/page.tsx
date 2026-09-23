import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StaffScreen } from '@/components/staff/staff-screen';
import type { AppLocale } from '@/i18n/routing';
import { loadStaffResource } from '@/lib/staff-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CurationPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Staff');
  const result = await loadStaffResource(locale as AppLocale, (api) =>
    api.getCurationDesk(),
  );

  return (
    <StaffScreen
      title={t('curatorTitle')}
      lede={t('curatorLede')}
      forbidden={t('forbidden')}
      allowed={result.ok}
    >
      <ul className="mt-10 grid gap-8 sm:grid-cols-2">
        {(['pairings', 'hangings', 'issues', 'channels'] as const).map(
          (key) => (
            <li key={key}>
              <h2 className="text-sm tracking-wide opacity-70">{t(key)}</h2>
              <p className="mt-3 text-sm opacity-70">{t('emptyCuration')}</p>
            </li>
          ),
        )}
      </ul>
    </StaffScreen>
  );
}
