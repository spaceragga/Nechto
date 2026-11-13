'use client';

import type { ReactNode } from 'react';
import type { SearchResults } from '@nechto/api-contract';
import { useTranslations } from 'next-intl';
import { WorkFrame } from '@/components/ui/work-frame';
import { excerpt } from '@/lib/excerpt';
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

function Section({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-baseline gap-3 font-sans text-sm tracking-[0.16em] text-[var(--accent)] uppercase">
        {label}
        <span className="font-sans text-xs tracking-normal text-[var(--fg)] opacity-45">
          {count}
        </span>
      </h2>
      <ul className="mt-4 flex flex-col gap-5">{children}</ul>
    </section>
  );
}

function Hit({
  href,
  src,
  alt,
  title,
  meta,
  snippet,
  thumb,
}: {
  href: string;
  src?: string | null;
  alt: string;
  title: string;
  meta?: string;
  snippet?: string;
  thumb?: ReactNode;
}) {
  const note = snippet && snippet !== title ? excerpt(snippet, 160) : '';

  return (
    <li>
      <Link
        href={href}
        className="group grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-4 no-underline sm:grid-cols-[5.5rem_minmax(0,1fr)]"
      >
        {thumb ?? (
          <WorkFrame
            src={src}
            alt={alt}
            fit="cover"
            staticFrame
            className="aspect-square w-full"
          />
        )}
        <div className="min-w-0 pt-0.5">
          <p className="truncate font-serif text-xl tracking-wide group-hover:text-[var(--accent)]">
            {title}
          </p>
          {meta ? (
            <p className="mt-1 truncate font-sans text-sm opacity-60">{meta}</p>
          ) : null}
          {note ? (
            <p className="mt-2 line-clamp-2 font-sans text-sm leading-relaxed opacity-80">
              {note}
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

export function SearchPageClient({ results, labels }: SearchPageClientProps) {
  const tCreators = useTranslations('Creators');
  const creators = results.creators.filter(
    (creator): creator is typeof creator & { slug: string } =>
      Boolean(creator.slug),
  );
  const empty =
    results.works.length === 0 &&
    creators.length === 0 &&
    results.projects.length === 0 &&
    results.articles.length === 0 &&
    results.dialogues.length === 0 &&
    results.studios.length === 0;

  if (empty) {
    return <p className="font-sans text-base opacity-70">{labels.empty}</p>;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-12">
      {creators.length > 0 ? (
        <Section label={labels.creators} count={creators.length}>
          {creators.map((creator) => (
            <Hit
              key={creator.slug}
              href={profilePath(creator.slug)}
              src={toUploadSrc(creator.avatarUrl)}
              alt={creator.displayName ?? creator.slug}
              title={creator.displayName ?? creator.slug}
              meta={creator.directions
                .map((direction) => tCreators(`directions.${direction}`))
                .join(' · ')}
              snippet={creator.bio ?? ''}
            />
          ))}
        </Section>
      ) : null}
      {results.works.length > 0 ? (
        <Section label={labels.works} count={results.works.length}>
          {results.works.map((work) => (
            <Hit
              key={work.id}
              href={workPath(work.author.slug, work.id)}
              src={toUploadSrc(work.imageUrl)}
              alt={work.title}
              title={work.title}
              meta={work.author.displayName}
              snippet={work.description}
              thumb={
                <WorkFrame
                  src={toUploadSrc(work.imageUrl)}
                  alt={work.title}
                  fit="cover"
                  staticFrame
                  className="aspect-3/4 w-full"
                />
              }
            />
          ))}
        </Section>
      ) : null}
      {results.projects.length > 0 ? (
        <Section label={labels.projects} count={results.projects.length}>
          {results.projects.map((project) => (
            <Hit
              key={project.id}
              href={projectPath(project.author.slug, project.id)}
              src={toUploadSrc(project.coverImageUrl)}
              alt={project.title}
              title={project.title}
              meta={project.author.displayName}
              snippet={project.description}
              thumb={
                <WorkFrame
                  src={toUploadSrc(project.coverImageUrl)}
                  alt={project.title}
                  fit="cover"
                  staticFrame
                  className="aspect-3/2 w-full"
                />
              }
            />
          ))}
        </Section>
      ) : null}
      {results.articles.length > 0 ? (
        <Section label={labels.articles} count={results.articles.length}>
          {results.articles.map((article) => (
            <Hit
              key={article.id}
              href={articlePath(article.id)}
              src={toUploadSrc(article.coverImageUrl)}
              alt={article.title}
              title={article.title}
              meta={article.author.displayName}
              snippet={article.lede}
              thumb={
                <WorkFrame
                  src={toUploadSrc(article.coverImageUrl)}
                  alt={article.title}
                  fit="cover"
                  staticFrame
                  className="aspect-3/2 w-full"
                />
              }
            />
          ))}
        </Section>
      ) : null}
      {results.dialogues.length > 0 ? (
        <Section label={labels.dialogues} count={results.dialogues.length}>
          {results.dialogues.map((dialogue) => (
            <Hit
              key={dialogue.id}
              href={dialoguePath(dialogue.id)}
              alt={dialogue.title}
              title={dialogue.title}
              meta={`${dialogue.left.author.displayName} · ${dialogue.right.author.displayName}`}
              snippet={dialogue.note}
              thumb={
                <div className="grid grid-cols-2 gap-0.5">
                  <WorkFrame
                    src={dialogue.left.imageUrl}
                    alt={dialogue.left.title}
                    fit="cover"
                    staticFrame
                    className="aspect-3/4 w-full"
                  />
                  <WorkFrame
                    src={dialogue.right.imageUrl}
                    alt={dialogue.right.title}
                    fit="cover"
                    staticFrame
                    className="aspect-3/4 w-full"
                  />
                </div>
              }
            />
          ))}
        </Section>
      ) : null}
      {results.studios.length > 0 ? (
        <Section label={labels.studios} count={results.studios.length}>
          {results.studios.map((studio) => (
            <Hit
              key={studio.slug}
              href={studioPath(studio.slug)}
              src={toUploadSrc(studio.coverUrl ?? studio.avatarUrl)}
              alt={studio.title}
              title={studio.title}
              meta={studio.displayName}
              snippet={studio.description || studio.bio}
              thumb={
                <WorkFrame
                  src={toUploadSrc(studio.coverUrl ?? studio.avatarUrl)}
                  alt={studio.title}
                  fit="cover"
                  staticFrame
                  className="aspect-3/2 w-full"
                />
              }
            />
          ))}
        </Section>
      ) : null}
    </div>
  );
}
