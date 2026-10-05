import type { StudioProfileSummary } from '@nechto/api-contract';
import { MediaTile } from '@/components/ui/media-tile';
import { WorkFrame } from '@/components/ui/work-frame';
import { excerpt } from '@/lib/excerpt';
import { toUploadSrc } from '@/lib/to-upload-src';
import { profilePath, workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type StudioProfileViewProps = {
  kicker: string;
  backLabel: string;
  empty: string;
  directionLabel: (direction: string) => string;
  profile: StudioProfileSummary;
};

export function StudioProfileView({
  kicker,
  backLabel,
  empty,
  directionLabel,
  profile,
}: StudioProfileViewProps) {
  const themes =
    profile.themes.length > 0 ? profile.themes : profile.directions;
  const heroSrc = profile.coverUrl ?? profile.latestWorks[0]?.imageUrl;

  return (
    <main className="flex w-full flex-col gap-12 px-6 py-12">
      <p className="font-sans text-sm">
        <Link href="/studio" className="text-[var(--accent)] no-underline">
          {backLabel}
        </Link>
      </p>

      <header className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <WorkFrame
          src={toUploadSrc(heroSrc)}
          alt={profile.title}
          fit="cover"
          className="aspect-4/5 w-full md:aspect-3/4"
        />
        <div className="max-w-lg">
          <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-70">
            {kicker}
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-wide md:text-5xl">
            {profile.title}
          </h1>
          <p className="mt-2 font-sans text-sm opacity-70">
            <Link
              href={profilePath(profile.slug)}
              className="text-[var(--accent)] no-underline"
            >
              {profile.displayName}
            </Link>
          </p>
          {themes.length > 0 ? (
            <p className="mt-3 font-sans text-sm opacity-70">
              {themes.map((direction) => directionLabel(direction)).join(' · ')}
            </p>
          ) : null}
          {profile.description ? (
            <p className="mt-4 font-serif text-sm leading-relaxed opacity-80">
              {excerpt(profile.description, 420)}
            </p>
          ) : null}
        </div>
      </header>

      {profile.latestWorks.length === 0 ? (
        <p className="text-sm opacity-70">{empty}</p>
      ) : (
        <section className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {profile.latestWorks.map((work) => (
            <MediaTile
              key={work.id}
              href={workPath(profile.slug, work.id)}
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
