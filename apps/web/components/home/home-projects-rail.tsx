import { getTranslations } from 'next-intl/server';
import { HomeSplitTile } from '@/components/home/home-split-tile';
import { FluidRail } from '@/components/ui/fluid-rail';
import type { ProjectSummary } from '@nechto/api-contract';
import { toUploadSrc } from '@/lib/to-upload-src';
import { profilePath, projectPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type HomeProjectsRailProps = {
  projects?: ProjectSummary[];
  empty?: string;
  catalogHref?: string;
};

export async function HomeProjectsRail({
  projects = [],
  empty,
  catalogHref = '/projects',
}: HomeProjectsRailProps) {
  const t = await getTranslations('HomePage');

  return (
    <section id="projects" className="scroll-mt-20">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="font-sans text-2xl tracking-wide">{t('projects')}</h2>
        <Link href={catalogHref} className="accent-mark font-sans text-base">
          {t('seeAll')}
        </Link>
      </div>
      {projects.length > 0 ? (
        <FluidRail minItem="16rem" className="items-start">
          {projects.map((project) => (
            <HomeSplitTile
              key={project.id}
              imageHref={projectPath(project.author.slug, project.id)}
              alt={project.title}
              title={project.title}
              src={toUploadSrc(project.coverImageUrl)}
              credits={[
                {
                  label: project.author.displayName,
                  href: profilePath(project.author.slug),
                },
              ]}
            />
          ))}
        </FluidRail>
      ) : (
        <p className="text-sm opacity-70">{empty ?? t('pending')}</p>
      )}
    </section>
  );
}
