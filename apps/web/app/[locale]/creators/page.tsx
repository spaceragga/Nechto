import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CreatorCard } from '@/components/creators/creator-card';
import { DirectionChips } from '@/components/direction-chips';
import { CREATOR_DIRECTION_IDS } from '@/lib/creator-directions';
import { loadPublishedCreators } from '@/lib/load-published-feed';
import { toUploadSrc } from '@/lib/to-upload-src';

type CreatorsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ direction?: string }>;
};

export default async function CreatorsPage({
  params,
  searchParams,
}: CreatorsPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const direction = CREATOR_DIRECTION_IDS.find(
    (item) => item === query.direction,
  );
  const t = await getTranslations('Creators');
  const creators = await loadPublishedCreators({
    direction,
    limit: 20,
  });

  return (
    <main className="w-full px-6 py-16">
      <h1 className="font-serif text-4xl tracking-wide">{t('title')}</h1>
      <div className="mt-6">
        <DirectionChips active={direction} />
      </div>
      {creators.length === 0 ? (
        <p className="mt-10 text-sm opacity-70">{t('empty')}</p>
      ) : (
        <section className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2">
          {creators.map((creator) => (
            <CreatorCard
              key={creator.slug}
              href={`/u/${creator.slug}`}
              name={creator.displayName ?? creator.slug}
              directionLabel={
                creator.directions[0]
                  ? t(`directions.${creator.directions[0]}`)
                  : undefined
              }
              portraitSrc={toUploadSrc(creator.avatarUrl)}
              works={creator.latestWorks.map((work) => ({
                src: toUploadSrc(work.imageUrl),
                alt: work.title,
              }))}
            />
          ))}
        </section>
      )}
    </main>
  );
}
