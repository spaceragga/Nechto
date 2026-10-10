import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ModerationArticlesDesk } from '@/components/moderation/moderation-articles-desk';
import { ModerationDialoguesDesk } from '@/components/moderation/moderation-dialogues-desk';
import { ModerationReportsDesk } from '@/components/moderation/moderation-reports-desk';
import { ModerationStudioDesk } from '@/components/moderation/moderation-studio-desk';
import { ModerationWorksDesk } from '@/components/moderation/moderation-works-desk';
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
      {result.ok ? (
        <>
          <ModerationReportsDesk />
          <ModerationWorksDesk
            liveWorks={result.data.liveWorks}
            hiddenWorks={result.data.hiddenWorks}
          />
          <ModerationArticlesDesk
            published={result.data.liveArticles}
            hiddenArticles={result.data.hiddenArticles}
          />
          <ModerationDialoguesDesk
            published={result.data.liveDialogues}
            hiddenDialogues={result.data.hiddenDialogues}
          />
          <ModerationStudioDesk
            published={result.data.liveStudio}
            hiddenStudio={result.data.hiddenStudio}
          />
        </>
      ) : null}
    </StaffScreen>
  );
}
