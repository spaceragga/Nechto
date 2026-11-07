import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
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
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{t('title')}</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm opacity-70">
          {t('lede')}
        </p>
      </header>
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
    </main>
  );
}
