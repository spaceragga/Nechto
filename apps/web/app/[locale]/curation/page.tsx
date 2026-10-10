import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CurationAuthorsDesk } from '@/components/curation/curation-authors-desk';
import { CurationBillboardDesk } from '@/components/curation/curation-billboard-desk';
import { CurationChannelsDesk } from '@/components/curation/curation-channels-desk';
import { CurationCreatorDesk } from '@/components/curation/curation-creator-desk';
import { CurationDialoguesDesk } from '@/components/curation/curation-dialogues-desk';
import { CurationHangingsDesk } from '@/components/curation/curation-hangings-desk';
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
          <CurationBillboardDesk
            featuredBillboard={result.data.featuredBillboard}
          />
          <CurationCreatorDesk
            creators={result.data.creators}
            featuredCreator={result.data.featuredCreator}
          />
          <CurationAuthorsDesk
            creators={result.data.creators}
            selectionCreators={result.data.selectionCreators}
          />
          <CurationHangingsDesk hangings={result.data.hangings} />
          <CurationChannelsDesk
            channels={result.data.channels}
            featuredChannel={result.data.featuredChannel}
          />
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
