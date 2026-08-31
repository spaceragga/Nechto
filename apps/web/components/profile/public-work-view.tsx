import { getTranslations } from 'next-intl/server';
import type { Work, WorkWithAuthor } from '@nechto/api-contract';
import { MediaTile } from '@/components/ui/media-tile';
import { WorkFrame } from '@/components/ui/work-frame';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type PublicWorkViewProps = {
  work: WorkWithAuthor;
  more: Work[];
};

export async function PublicWorkView({ work, more }: PublicWorkViewProps) {
  const t = await getTranslations('WorkPage');
  const tCreators = await getTranslations('Creators');
  const src = toUploadSrc(work.imageUrl);
  const authorHref = `/u/${work.author.slug}`;

  return (
    <main className="w-full px-6 py-12">
      <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-70">
        {t('kicker')}
      </p>
      <h1 className="mt-2 font-serif text-4xl tracking-wide md:text-5xl">
        {work.title}
      </h1>
      <p className="mt-3 font-serif text-sm opacity-70">
        <Link href={authorHref} className="underline">
          {work.author.displayName}
        </Link>
        {work.author.directions[0]
          ? ` · ${tCreators(`directions.${work.author.directions[0]}`)}`
          : ''}
      </p>
      {src ? (
        <WorkFrame
          src={src}
          alt={work.title}
          fit="contain"
          className="mt-8 h-[28rem] w-full md:h-[36rem]"
        />
      ) : null}
      {more.length > 0 ? (
        <section className="mt-12">
          <p className="font-sans text-sm opacity-70">{t('more')}</p>
          <div className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((item) => (
              <MediaTile
                key={item.id}
                href={workPath(work.author.slug, item.id)}
                title={item.title}
                subtitle={work.author.displayName}
                src={toUploadSrc(item.imageUrl)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
