import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CurationDialoguesDesk } from '@/components/curation/curation-dialogues-desk';
import { CurationJournalDesk } from '@/components/curation/curation-journal-desk';
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
  const result = await loadStaffResource(locale as AppLocale, async (api) => {
    const [desk, works] = await Promise.all([
      api.getCurationDesk(),
      api.listPublishedWorks({ limit: 80 }).catch(() => ({ items: [] })),
    ]);
    return { desk, works: works.items };
  });

  return (
    <StaffScreen
      title={t('curatorTitle')}
      lede={t('curatorLede')}
      forbidden={t('forbidden')}
      allowed={result.ok}
    >
      {result.ok ? (
        <>
          <CurationJournalDesk
            issues={result.data.desk.issues}
            featuredArticle={result.data.desk.featuredArticle}
          />
          <CurationDialoguesDesk
            pairings={result.data.desk.pairings}
            featuredDialogue={result.data.desk.featuredDialogue}
            works={result.data.works}
          />
        </>
      ) : null}
    </StaffScreen>
  );
}
