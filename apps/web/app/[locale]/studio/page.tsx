import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StudioIndex } from '@/components/studio/studio-index';
import { loadStudioProfiles, loadStudioWorks } from '@/lib/load-published-feed';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function StudioPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Studio');
  const tCreators = await getTranslations('Creators');
  const [creators, works] = await Promise.all([
    loadStudioProfiles(24),
    loadStudioWorks(18),
  ]);
  const featured = creators[0] ?? null;

  return (
    <StudioIndex
      title={t('title')}
      lede={t('lede')}
      featuredKicker={t('featuredKicker')}
      themesLabel={t('themes')}
      worksLabel={t('works')}
      empty={t('empty')}
      directionLabel={(direction) => tCreators(`directions.${direction}`)}
      featured={featured}
      creators={creators}
      works={works}
    />
  );
}
