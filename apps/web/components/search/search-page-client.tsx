'use client';

import type { SearchResults } from '@nechto/api-contract';
import { MediaTile } from '@/components/ui/media-tile';
import { toUploadSrc } from '@/lib/to-upload-src';
import {
  articlePath,
  dialoguePath,
  profilePath,
  projectPath,
  studioPath,
  workPath,
} from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type SearchPageClientProps = {
  results: SearchResults;
  labels: {
    works: string;
    creators: string;
    projects: string;
    articles: string;
    dialogues: string;
    studios: string;
    empty: string;
  };
};

export function SearchPageClient({ results, labels }: SearchPageClientProps) {
  const empty =
    results.works.length === 0 &&
    results.creators.length === 0 &&
    results.projects.length === 0 &&
    results.articles.length === 0 &&
    results.dialogues.length === 0 &&
    results.studios.length === 0;

  if (empty) {
    return <p className="text-sm opacity-70">{labels.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      {results.works.length > 0 ? (
        <section>
          <h2 className="font-serif text-2xl tracking-wide">{labels.works}</h2>
          <div className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {results.works.map((work) => (
              <MediaTile
                key={work.id}
                href={workPath(work.author.slug, work.id)}
                title={work.title}
                subtitle={work.author.displayName}
                src={toUploadSrc(work.imageUrl)}
              />
            ))}
          </div>
        </section>
      ) : null}
      {results.creators.length > 0 ? (
        <section>
          <h2 className="font-serif text-2xl tracking-wide">
            {labels.creators}
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {results.creators.map((creator) => (
              <li key={creator.slug ?? creator.displayName}>
                <Link
                  href={profilePath(creator.slug ?? '')}
                  className="font-serif text-lg tracking-wide"
                >
                  {creator.displayName ?? creator.slug}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {results.projects.length > 0 ? (
        <section>
          <h2 className="font-serif text-2xl tracking-wide">
            {labels.projects}
          </h2>
          <div className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {results.projects.map((project) => (
              <MediaTile
                key={project.id}
                href={projectPath(project.author.slug, project.id)}
                title={project.title}
                subtitle={project.author.displayName}
                src={toUploadSrc(project.coverImageUrl)}
              />
            ))}
          </div>
        </section>
      ) : null}
      {results.articles.length > 0 ? (
        <section>
          <h2 className="font-serif text-2xl tracking-wide">
            {labels.articles}
          </h2>
          <div className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {results.articles.map((article) => (
              <MediaTile
                key={article.id}
                href={articlePath(article.id)}
                title={article.title}
                subtitle={article.author.displayName}
                src={toUploadSrc(article.coverImageUrl)}
              />
            ))}
          </div>
        </section>
      ) : null}
      {results.dialogues.length > 0 ? (
        <section>
          <h2 className="font-serif text-2xl tracking-wide">
            {labels.dialogues}
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {results.dialogues.map((dialogue) => (
              <li key={dialogue.id}>
                <Link
                  href={dialoguePath(dialogue.id)}
                  className="font-serif text-lg tracking-wide"
                >
                  {dialogue.title}
                </Link>
                <p className="text-sm opacity-70">
                  {dialogue.left.author.displayName} ·{' '}
                  {dialogue.right.author.displayName}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {results.studios.length > 0 ? (
        <section>
          <h2 className="font-serif text-2xl tracking-wide">
            {labels.studios}
          </h2>
          <div className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {results.studios.map((studio) => (
              <MediaTile
                key={studio.slug}
                href={studioPath(studio.slug)}
                title={studio.title}
                subtitle={studio.displayName}
                src={toUploadSrc(studio.coverUrl)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
