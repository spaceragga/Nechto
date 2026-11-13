import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { HouseIntro } from '@/components/house-intro';
import { SearchPageClient } from '@/components/search/search-page-client';
import { createServerApiClient } from '@/lib/api-server';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

const emptyResults = (q: string) => ({
  q,
  works: [],
  creators: [],
  projects: [],
  articles: [],
  dialogues: [],
  studios: [],
});

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { q = '' } = await searchParams;
  setRequestLocale(locale);

  const query = q.trim();
  if (query.length < 2) {
    redirect({ href: '/', locale });
  }

  const t = await getTranslations('Search');
  const api = await createServerApiClient();
  const results = await api
    .search({ q: query, limit: 12 })
    .catch(() => emptyResults(query));

  return (
    <main className="flex w-full flex-col gap-10 px-6 py-12">
      <HouseIntro title={t('title')} lede={t('lede')} />
      <div className="pl-12 sm:pl-24">
        <SearchPageClient
          results={results}
          labels={{
            works: t('works'),
            creators: t('creators'),
            projects: t('projects'),
            articles: t('articles'),
            dialogues: t('dialogues'),
            studios: t('studios'),
            empty: t('empty'),
          }}
        />
      </div>
    </main>
  );
}
