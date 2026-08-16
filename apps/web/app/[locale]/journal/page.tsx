import { ExploreStubPage } from '@/components/explore-stub-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default function JournalPage({ params }: PageProps) {
  return <ExploreStubPage params={params} namespace="Journal" />;
}
