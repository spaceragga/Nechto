import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { MediaTile } from '@/components/ui/media-tile';
import { PublicProfileView } from '@/components/profile/public-profile-view';
import type { DemoStillKind } from '@/lib/demo-media';
import { loadPublishedProfile } from '@/lib/load-published-feed';

type PublicProfilePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

type DemoWorkCard = {
  title: string;
  author: string;
  still?: DemoStillKind;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const published = await loadPublishedProfile(slug);
  if (published) {
    return (
      <PublicProfileView profile={published.profile} works={published.works} />
    );
  }

  if (slug === 'demo') {
    return <DemoPublicProfile slug={slug} />;
  }

  notFound();
}

async function DemoPublicProfile({ slug }: { slug: string }) {
  const t = await getTranslations('PublicProfile');
  const tHome = await getTranslations('HomePage');
  const works = tHome.raw('workCards') as DemoWorkCard[];

  return (
    <main className="w-full px-6 py-12">
      <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-70">
        {t('kicker')}
      </p>
      <h1 className="mt-2 font-serif text-4xl tracking-wide md:text-5xl">
        {slug}
      </h1>
      <p className="mt-8 font-sans text-sm opacity-70">{t('works')}</p>
      <section className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <MediaTile
            key={work.title}
            href={`/u/${slug}`}
            title={work.title}
            subtitle={work.author}
            still={work.still}
          />
        ))}
      </section>
    </main>
  );
}
