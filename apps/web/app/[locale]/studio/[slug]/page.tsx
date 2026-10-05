import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { StudioProfileView } from '@/components/studio/studio-profile-view';
import { loadStudioProfileBySlug } from '@/lib/load-published-feed';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function StudioProfilePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const profile = await loadStudioProfileBySlug(slug);
  if (!profile) {
    notFound();
  }

  const t = await getTranslations('Studio');
  const tCreators = await getTranslations('Creators');

  return (
    <StudioProfileView
      kicker={t('profileKicker')}
      backLabel={t('backToIndex')}
      empty={t('profileEmpty')}
      directionLabel={(direction) => tCreators(`directions.${direction}`)}
      profile={profile}
    />
  );
}
