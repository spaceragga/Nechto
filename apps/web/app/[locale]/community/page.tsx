import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CommunityFeed } from '@/components/community/community-feed';
import { excerpt } from '@/lib/excerpt';
import {
  loadPublishedCreators,
  loadPublishedWorks,
} from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CommunityFeedPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('CommunityFeed');
  const [creators, works] = await Promise.all([
    loadPublishedCreators({ limit: 12 }),
    loadPublishedWorks(24),
  ]);

  return (
    <CommunityFeed
      title={t('title')}
      lede={t('lede')}
      peopleLabel={t('people')}
      wallLabel={t('wall')}
      empty={t('empty')}
      people={creators.map((creator) => ({
        href: `/u/${creator.slug}`,
        name: creator.displayName ?? creator.slug,
        lede: excerpt(creator.bio, 140),
        src: toUploadSrc(creator.avatarUrl),
      }))}
      works={works}
    />
  );
}
