import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StaffScreen } from '@/components/staff/staff-screen';
import type { AppLocale } from '@/i18n/routing';
import { loadStaffResource } from '@/lib/staff-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ModerationPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Staff');
  const result = await loadStaffResource(locale as AppLocale, (api) =>
    api.getModerationDesk(),
  );

  return (
    <StaffScreen
      title={t('moderatorTitle')}
      lede={t('moderatorLede')}
      forbidden={t('forbidden')}
      allowed={result.ok}
    >
      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <section>
          <h2 className="text-sm tracking-wide opacity-70">{t('reports')}</h2>
          <p className="mt-3 text-sm opacity-70">{t('emptyReports')}</p>
        </section>
        <section>
          <h2 className="text-sm tracking-wide opacity-70">
            {t('hiddenWorks')}
          </h2>
          <p className="mt-3 text-sm opacity-70">{t('emptyHidden')}</p>
        </section>
      </div>
    </StaffScreen>
  );
}
