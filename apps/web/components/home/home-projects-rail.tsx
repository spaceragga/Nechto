import { getTranslations } from 'next-intl/server';
import { FluidRail } from '@/components/ui/fluid-rail';
import { MediaTile } from '@/components/ui/media-tile';
import type { ProjectSummary } from '@nechto/api-contract';
import { toUploadSrc } from '@/lib/to-upload-src';
import { projectPath } from '@/lib/work-path';
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
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-sans text-xl tracking-wide">{t('projects')}</h2>
        <Link href={catalogHref} className="font-sans text-sm">
          {t('seeAll')}
        </Link>
      </div>
      {projects.length > 0 ? (
        <FluidRail minItem="16rem">
          {projects.map((project) => (
            <MediaTile
              key={project.id}
              href={projectPath(project.author.slug, project.id)}
              title={project.title}
              subtitle={project.author.displayName}
              src={toUploadSrc(project.coverImageUrl)}
            />
          ))}
        </FluidRail>
      ) : (
        <p className="text-sm opacity-70">{empty ?? t('pending')}</p>
      )}
    </section>
  );
}
