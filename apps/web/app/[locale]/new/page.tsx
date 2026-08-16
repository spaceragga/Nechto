import { ExploreStubPage } from '@/components/explore-stub-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default function FreshPage({ params }: PageProps) {
  return <ExploreStubPage params={params} namespace="Fresh" />;
}
