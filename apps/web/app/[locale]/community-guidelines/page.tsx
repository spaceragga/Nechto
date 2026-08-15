import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PolicyPage } from '@/components/policy-page';

export default async function CommunityGuidelinesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Policies.community');
  return (
    <PolicyPage
      title={t('title')}
      updated={t('updated')}
      paragraphs={t.raw('paragraphs') as string[]}
    />
  );
}
