import { getTranslations } from 'next-intl/server';
import type { Work, WorkWithAuthor } from '@nechto/api-contract';
import { CommentsSection } from '@/components/comments/comments-section';
import { ReportForm } from '@/components/report-form';
import {
  EngagementOverlay,
  EngagementRail,
  EngagementScope,
} from '@/components/social/engagement-bar';
import { MediaTile } from '@/components/ui/media-tile';
import { WorkFrame } from '@/components/ui/work-frame';
import { excerpt } from '@/lib/excerpt';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath, profilePath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type PublicWorkViewProps = {
  work: WorkWithAuthor;
  more: Work[];
  canReport?: boolean;
  viewerEmail?: string;
};

export async function PublicWorkView({
  work,
  more,
  canReport = false,
  viewerEmail,
}: PublicWorkViewProps) {
  const t = await getTranslations('WorkPage');
  const tCreators = await getTranslations('Creators');
  const src = toUploadSrc(work.imageUrl);
  const authorHref = profilePath(work.author.slug);
  const direction = work.author.directions[0]
    ? tCreators(`directions.${work.author.directions[0]}`)
    : null;

  return (
    <EngagementScope
      targetType="work"
      targetId={work.id}
      signedIn={Boolean(viewerEmail)}
    >
      <main className="w-full text-center">
        <EngagementRail />
        <div className="px-6 py-12">
          <p className="font-sans text-sm tracking-[0.16em] uppercase opacity-70">
            {t('kicker')}
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-wide md:text-5xl">
            {work.title}
          </h1>
          <p className="mt-3 font-serif text-base opacity-70">
            <Link href={authorHref}>{work.author.displayName}</Link>
            {direction ? ` · ${direction}` : ''}
          </p>
          {work.description ? (
            <p className="mx-auto mt-6 max-w-2xl font-serif text-base leading-relaxed opacity-90">
              {work.description}
            </p>
          ) : null}
          {src ? (
            <EngagementOverlay className="mt-8">
              <WorkFrame
                src={src}
                alt={work.title}
                fit="contain"
                className="h-[28rem] w-full md:h-[36rem]"
              />
            </EngagementOverlay>
          ) : null}
          {canReport ? (
            <div className="mx-auto mt-10 max-w-md">
              <ReportForm
                target={{ targetType: 'work', targetId: work.id }}
                viewerEmail={viewerEmail}
                className="mt-0"
              />
            </div>
          ) : null}
          <CommentsSection
            targetType="work"
            targetId={work.id}
            signedIn={Boolean(viewerEmail)}
          />
          {more.length > 0 ? (
            <section className="mt-12">
              <p className="font-sans text-base opacity-70">{t('more')}</p>
              <div className="mt-4 grid gap-x-8 gap-y-10 sm:grid-cols-2">
                {more.map((item) => (
                  <MediaTile
                    key={item.id}
                    href={workPath(work.author.slug, item.id)}
                    title={item.title}
                    subtitle={
                      item.description
                        ? excerpt(item.description, 110)
                        : work.author.displayName
                    }
                    src={toUploadSrc(item.imageUrl)}
                    wellClassName="aspect-[3/2] w-full"
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </EngagementScope>
  );
}
