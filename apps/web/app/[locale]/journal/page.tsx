import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  JournalIndex,
  type JournalIssue,
} from '@/components/journal/journal-index';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function JournalPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Journal');

  return (
    <JournalIndex
      title={t('title')}
      lede={t('lede')}
      issues={t.raw('issues') as JournalIssue[]}
    />
  );
}
