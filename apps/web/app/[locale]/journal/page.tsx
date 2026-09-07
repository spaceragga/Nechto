import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  JournalIndex,
  type JournalIssue,
} from '@/components/journal/journal-index';
import { loadPublishedCreators } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function JournalPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Journal');
  const tCreators = await getTranslations('Creators');
  const creators = await loadPublishedCreators({ limit: 20 });

  const issues: JournalIssue[] = creators.flatMap((creator) => {
    const work = creator.latestWorks.find((item) => item.description?.trim());
    if (!work) {
      return [];
    }
    return [
      {
        href: workPath(creator.slug, work.id),
        kicker: t('kicker'),
        title: work.title,
        meta: [
          creator.directions[0]
            ? tCreators(`directions.${creator.directions[0]}`)
            : null,
          creator.displayName ?? creator.slug,
        ]
          .filter(Boolean)
          .join(' · '),
        src: toUploadSrc(work.imageUrl),
      },
    ];
  });

  return (
    <JournalIndex
      title={t('title')}
      lede={t('lede')}
      empty={t('empty')}
      issues={issues}
    />
  );
}
