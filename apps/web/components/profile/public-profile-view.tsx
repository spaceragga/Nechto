import { getTranslations } from 'next-intl/server';
import type { PublicProfile, Work } from '@nechto/api-contract';
import { MediaTile } from '@/components/ui/media-tile';
import { WorkFrame } from '@/components/ui/work-frame';
import { excerpt } from '@/lib/excerpt';
import { toUploadSrc } from '@/lib/to-upload-src';

type PublicProfileViewProps = {
  profile: PublicProfile;
  works: Work[];
};

export async function PublicProfileView({
  profile,
  works,
}: PublicProfileViewProps) {
  const t = await getTranslations('PublicProfile');
  const title = profile.displayName ?? profile.slug ?? '';

  const photoSrc = toUploadSrc(profile.avatarUrl);

  return (
    <main className="w-full px-6 py-12">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-70">
            {t('kicker')}
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-wide md:text-5xl">
            {title}
          </h1>
          {profile.bio ? (
            <p className="mt-4 max-w-2xl font-sans text-sm opacity-70">
              {profile.bio}
            </p>
          ) : null}
          {profile.directions.length > 0 ? (
            <p className="mt-3 font-sans text-sm opacity-70">
              {profile.directions
                .map((direction) => t(`directions.${direction}`))
                .join(' · ')}
            </p>
          ) : null}
        </div>
        {photoSrc ? (
          <div data-public-profile-photo className="shrink-0">
            <WorkFrame
              src={photoSrc}
              alt={title}
              fit="cover"
              className="aspect-3/4 w-28 sm:w-40 md:w-44"
            />
          </div>
        ) : null}
      </div>
      <p className="mt-8 font-sans text-sm opacity-70">{t('works')}</p>
      {works.length === 0 ? (
        <p className="mt-4 text-sm opacity-70">{t('empty')}</p>
      ) : (
        <section className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => (
            <MediaTile
              key={work.id}
              href={`/u/${profile.slug}/${work.id}`}
              title={work.title}
              subtitle={
                work.description ? excerpt(work.description, 110) : undefined
              }
              src={toUploadSrc(work.imageUrl)}
            />
          ))}
        </section>
      )}
    </main>
  );
}
