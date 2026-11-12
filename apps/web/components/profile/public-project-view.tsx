import { getTranslations } from 'next-intl/server';
import type { PublicProject } from '@nechto/api-contract';
import { CommentsSection } from '@/components/comments/comments-section';
import { ReportForm } from '@/components/report-form';
import {
  EngagementRail,
  EngagementScope,
} from '@/components/social/engagement-bar';
import { WorkFrame } from '@/components/ui/work-frame';
import { toUploadSrc } from '@/lib/to-upload-src';
import { profilePath, workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type PublicProjectViewProps = {
  project: PublicProject;
  canReport?: boolean;
  viewerEmail?: string;
};

export async function PublicProjectView({
  project,
  canReport = false,
  viewerEmail,
}: PublicProjectViewProps) {
  const t = await getTranslations('ProjectPage');
  const authorHref = profilePath(project.author.slug);

  return (
    <EngagementScope
      targetType="project"
      targetId={project.id}
      signedIn={Boolean(viewerEmail)}
    >
      <main className="w-full text-center">
        <EngagementRail />
        <div className="px-6 py-12">
          <p className="font-sans text-sm tracking-[0.16em] uppercase opacity-70">
            {t('kicker')}
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-wide md:text-5xl">
            {project.title}
          </h1>
          <p className="mt-3 font-serif text-base opacity-70">
            <Link href={`${authorHref}?pane=projects`}>
              {project.author.displayName}
            </Link>
          </p>
          {project.description ? (
            <p className="mx-auto mt-6 max-w-2xl font-serif text-base leading-relaxed opacity-90">
              {project.description}
            </p>
          ) : null}
          <div className="mt-10 flex flex-col gap-10">
            {project.blocks.map((block, index) =>
              block.kind === 'image' ? (
                <Link
                  key={`${block.work.id}-${index}`}
                  href={workPath(project.author.slug, block.work.id)}
                  className="block"
                >
                  <WorkFrame
                    src={toUploadSrc(block.work.imageUrl)}
                    alt={block.work.title}
                    fit="contain"
                    className="h-[28rem] w-full md:h-[36rem]"
                  />
                  {block.showTitle ? (
                    <p className="mt-3 font-serif text-xl tracking-wide">
                      {block.work.title}
                    </p>
                  ) : null}
                </Link>
              ) : (
                <p
                  key={`text-${index}`}
                  className="mx-auto max-w-2xl font-serif text-base leading-relaxed opacity-90"
                >
                  {block.body}
                </p>
              ),
            )}
          </div>
          {canReport ? (
            <div className="mx-auto mt-10 max-w-md">
              <ReportForm
                target={{ targetType: 'project', targetId: project.id }}
                viewerEmail={viewerEmail}
                className="mt-0"
              />
            </div>
          ) : null}
          <CommentsSection
            targetType="project"
            targetId={project.id}
            signedIn={Boolean(viewerEmail)}
          />
        </div>
      </main>
    </EngagementScope>
  );
}
