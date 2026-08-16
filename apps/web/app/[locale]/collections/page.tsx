import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  CollectionsGrid,
  type CollectionChannel,
} from '@/components/collections/collections-grid';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CollectionsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Collections');

  return (
    <CollectionsGrid
      title={t('title')}
      lede={t('lede')}
      channels={t.raw('channels') as CollectionChannel[]}
    />
  );
}
