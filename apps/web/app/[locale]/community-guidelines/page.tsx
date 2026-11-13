import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PolicyPage, type PolicySection } from '@/components/policy-page';

type PolicyRouteProps = {
  params: Promise<{ locale: string }>;
};

export default async function CommunityGuidelinesPage({
  params,
}: PolicyRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Policies.community');

  return (
    <PolicyPage
      title={t('title')}
      lede={t('lede')}
      updated={t('updated')}
      sections={t.raw('sections') as PolicySection[]}
    />
  );
}
