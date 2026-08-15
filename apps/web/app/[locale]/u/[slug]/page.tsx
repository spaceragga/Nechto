import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactLink } from '@/components/contact-link';
import { ReportProfileForm } from '@/components/report-profile-form';
import { loadPublicProfile } from '@/lib/public-data';

type PublicProfilePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [creator, t] = await Promise.all([
    loadPublicProfile(slug),
    getTranslations('PublicProfile'),
  ]);
  if (!creator) notFound();

  const { profile, works } = creator;
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16">
      <header className="flex flex-col gap-6 md:flex-row md:items-center">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Media is pre-optimized by the API.
          <img
            src={profile.avatarUrl}
            alt=""
            className="h-32 w-32 rounded-full object-cover"
          />
        ) : null}
        <div className="space-y-3">
          <h1 className="text-4xl">{profile.displayName}</h1>
          {profile.bio ? <p className="max-w-2xl">{profile.bio}</p> : null}
          <p className="text-sm opacity-70">
            {profile.directions
              .map((direction) => t(`directions.${direction}`))
              .join(' · ')}
          </p>
          <div className="flex flex-wrap gap-4">
            {profile.websiteUrl ? (
              <ContactLink slug={slug} href={profile.websiteUrl}>
                {t('website')}
              </ContactLink>
            ) : null}
            {profile.instagramUrl ? (
              <ContactLink slug={slug} href={profile.instagramUrl}>
                {t('instagram')}
              </ContactLink>
            ) : null}
            {profile.telegramUrl ? (
              <ContactLink slug={slug} href={profile.telegramUrl}>
                {t('telegram')}
              </ContactLink>
            ) : null}
          </div>
        </div>
      </header>

      <section
        aria-label={t('works')}
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {works.map((work) => (
          <figure key={work.id}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Media is pre-optimized by the API. */}
            <img
              src={work.imageUrl}
              alt={work.altText}
              width={work.width}
              height={work.height}
              className="h-auto w-full rounded-sm object-cover"
              loading="lazy"
            />
            <figcaption className="mt-2">
              <strong>{work.title}</strong>
              {work.caption ? <p className="text-sm">{work.caption}</p> : null}
            </figcaption>
          </figure>
        ))}
      </section>
      <div className="mt-12">
        <ReportProfileForm slug={slug} />
      </div>
    </main>
  );
}
