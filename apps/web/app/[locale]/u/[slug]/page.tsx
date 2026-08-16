import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MediaTile } from '@/components/ui/media-tile';

type PublicProfilePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('PublicProfile');
  const tHome = await getTranslations('HomePage');
  const works = tHome.raw('workCards') as Array<{
    title: string;
    author: string;
  }>;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-4xl tracking-wide">{slug}</h1>
      <p className="mt-2 text-sm opacity-70">{t('works')}</p>
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {works.map((work) => (
          <MediaTile
            key={work.title}
            href={`/u/${slug}`}
            title={work.title}
            subtitle={work.author}
          />
        ))}
      </section>
    </main>
  );
}
