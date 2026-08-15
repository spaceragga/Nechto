import {
  CREATOR_DIRECTIONS,
  creatorDirectionSchema,
} from '@nechto/api-contract';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { z } from 'zod';
import { Link } from '@/i18n/navigation';
import { loadCreators } from '@/lib/public-data';

const cursorSchema = z.string().cuid();

type CreatorsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ direction?: string; cursor?: string }>;
};

export default async function CreatorsPage({
  params,
  searchParams,
}: CreatorsPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const parsedDirection = creatorDirectionSchema.safeParse(query.direction);
  const direction = parsedDirection.success ? parsedDirection.data : undefined;
  const parsedCursor = cursorSchema.safeParse(query.cursor);
  const cursor = parsedCursor.success ? parsedCursor.data : undefined;
  setRequestLocale(locale);
  const [catalog, t] = await Promise.all([
    loadCreators({ direction, cursor, limit: 12 }),
    getTranslations('Creators'),
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16">
      <h1 className="text-4xl">{t('title')}</h1>
      <nav aria-label={t('filter')} className="mt-6 flex flex-wrap gap-3">
        <Link href="/creators" className={!direction ? 'underline' : ''}>
          {t('all')}
        </Link>
        {CREATOR_DIRECTIONS.map((item) => (
          <Link
            key={item}
            href={{ pathname: '/creators', query: { direction: item } }}
            className={direction === item ? 'underline' : ''}
          >
            {t(`directions.${item}`)}
          </Link>
        ))}
      </nav>
      {catalog.items.length === 0 ? (
        <p className="mt-10 opacity-70">{t('empty')}</p>
      ) : (
        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.items.map((profile) => (
            <Link
              key={profile.id}
              href={`/u/${profile.slug!}`}
              className="border p-4"
            >
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Media is pre-optimized by the API.
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <h2 className="mt-3 text-xl">{profile.displayName}</h2>
              <p className="mt-1 text-sm opacity-70">
                {profile.directions
                  .map((item) => t(`directions.${item}`))
                  .join(' · ')}
              </p>
            </Link>
          ))}
        </section>
      )}
      {catalog.nextCursor ? (
        <Link
          href={{
            pathname: '/creators',
            query: {
              ...(direction ? { direction } : {}),
              cursor: catalog.nextCursor,
            },
          }}
          className="mt-8 inline-block underline"
        >
          {t('loadMore')}
        </Link>
      ) : null}
    </main>
  );
}
