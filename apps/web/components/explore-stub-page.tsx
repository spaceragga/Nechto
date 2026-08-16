import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StubPage } from '@/components/stub-page';

export const EXPLORE_STUB_NAMESPACES = [
  'TopWorks',
  'Fresh',
  'Collections',
  'Journal',
  'CommunityFeed',
] as const;

export type ExploreStubNamespace = (typeof EXPLORE_STUB_NAMESPACES)[number];

type ExploreStubPageProps = {
  params: Promise<{ locale: string }>;
  namespace: ExploreStubNamespace;
};

export async function ExploreStubPage({
  params,
  namespace,
}: ExploreStubPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations(namespace);

  return <StubPage title={t('title')} body={t('body')} />;
}
