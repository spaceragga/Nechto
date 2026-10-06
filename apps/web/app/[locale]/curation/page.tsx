import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CurationDialoguesDesk } from '@/components/curation/curation-dialogues-desk';
import { CurationJournalDesk } from '@/components/curation/curation-journal-desk';
import { CurationStudioDesk } from '@/components/curation/curation-studio-desk';
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
      {result.ok ? (
        <>
          <CurationJournalDesk
            issues={result.data.issues}
            featuredArticle={result.data.featuredArticle}
          />
          <CurationDialoguesDesk
            pairings={result.data.pairings}
            featuredDialogue={result.data.featuredDialogue}
          />
          <CurationStudioDesk
            listed={result.data.studioListed}
            candidates={result.data.studioCandidates}
            featuredStudio={result.data.featuredStudio}
          />
        </>
      ) : null}
    </StaffScreen>
  );
}
