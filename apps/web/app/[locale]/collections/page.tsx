import { ExploreStubPage } from '@/components/explore-stub-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default function CollectionsPage({ params }: PageProps) {
  return <ExploreStubPage params={params} namespace="Collections" />;
}
