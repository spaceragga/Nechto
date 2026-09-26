import { getTranslations } from 'next-intl/server';
import type {
  ArticleSummary,
  PublicProfile,
  ProjectSummary,
  Work,
} from '@nechto/api-contract';
import { QueryScrollLock } from '@/components/query-scroll-lock';
import { MediaTile } from '@/components/ui/media-tile';
import { ChipLink } from '@/components/ui/chip-link';
import { WorkFrame } from '@/components/ui/work-frame';
import { excerpt } from '@/lib/excerpt';
import { toUploadSrc } from '@/lib/to-upload-src';
import {
  articlePath,
  profilePath,
  projectPath,
  workPath,
} from '@/lib/work-path';

type PublicProfileViewProps = {
  profile: PublicProfile;
  works: Work[];
  projects: ProjectSummary[];
  articles: ArticleSummary[];
  pane?: string;
};

export async function PublicProfileView({
  profile,
  works,
  projects,
  articles,
  pane,
}: PublicProfileViewProps) {
  const t = await getTranslations('PublicProfile');
  const title = profile.displayName ?? profile.slug ?? '';
  const photoSrc = toUploadSrc(profile.avatarUrl);
  const slug = profile.slug ?? '';
  const projectsPane = pane === 'projects';
  const journalPane = pane === 'journal';
  const href = profilePath(slug);
  const scrollToken = journalPane
    ? 'journal'
    : projectsPane
      ? 'projects'
      : 'works';

  return (
    <main className="w-full px-6 py-12">
      <QueryScrollLock token={scrollToken} />
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

      <nav aria-label={t('pane')} className="mt-8 flex flex-wrap gap-4">
        <ChipLink
          href={href}
          active={!projectsPane && !journalPane}
          scroll={false}
        >
          {t('works')}
        </ChipLink>
        <ChipLink
          href={`${href}?pane=projects`}
          active={projectsPane}
          scroll={false}
        >
          {t('projects')}
        </ChipLink>
        <ChipLink
          href={`${href}?pane=journal`}
          active={journalPane}
          scroll={false}
        >
          {t('journal')}
        </ChipLink>
      </nav>

      {journalPane ? (
        articles.length === 0 ? (
          <p className="mt-4 text-sm opacity-70">{t('emptyJournal')}</p>
        ) : (
          <section className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <MediaTile
                key={article.id}
                href={articlePath(article.id)}
                title={article.title}
                subtitle={article.lede ? excerpt(article.lede, 110) : undefined}
                src={toUploadSrc(article.coverImageUrl)}
              />
            ))}
          </section>
        )
      ) : projectsPane ? (
        projects.length === 0 ? (
          <p className="mt-4 text-sm opacity-70">{t('emptyProjects')}</p>
        ) : (
          <section className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <MediaTile
                key={project.id}
                href={projectPath(slug, project.id)}
                title={project.title}
                subtitle={
                  project.description
                    ? excerpt(project.description, 110)
                    : undefined
                }
                src={toUploadSrc(project.coverImageUrl)}
              />
            ))}
          </section>
        )
      ) : works.length === 0 ? (
        <p className="mt-4 text-sm opacity-70">{t('empty')}</p>
      ) : (
        <section className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => (
            <MediaTile
              key={work.id}
              href={workPath(slug, work.id)}
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
