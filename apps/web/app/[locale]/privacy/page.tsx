import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PolicyPage } from '@/components/policy-page';

type PolicyRouteProps = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: PolicyRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Policies.privacy');

  return (
    <PolicyPage
      title={t('title')}
      updated={t('updated')}
      paragraphs={t.raw('paragraphs') as string[]}
    />
  );
}
