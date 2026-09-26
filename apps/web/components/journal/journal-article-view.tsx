import { getTranslations } from 'next-intl/server';
import type { PublicArticle } from '@nechto/api-contract';
import { WorkFrame } from '@/components/ui/work-frame';
import { toUploadSrc } from '@/lib/to-upload-src';
import { profilePath } from '@/lib/work-path';
import { Link } from '@/i18n/navigation';

type JournalArticleViewProps = {
  article: PublicArticle;
};

export async function JournalArticleView({ article }: JournalArticleViewProps) {
  const t = await getTranslations('Journal');
  const tCreators = await getTranslations('Creators');
  const paragraphs = article.body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  const direction = article.author.directions[0]
    ? tCreators(`directions.${article.author.directions[0]}`)
    : null;
  const cover = toUploadSrc(article.coverImageUrl);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-70">
        {t('kicker')}
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-wide md:text-5xl">
        {article.title}
      </h1>
      <p className="mt-4 font-serif text-sm opacity-70">
        <Link href={profilePath(article.author.slug)}>
          {article.author.displayName}
        </Link>
        {direction ? ` · ${direction}` : ''}
      </p>
      {article.lede ? (
        <p className="mt-8 font-serif text-xl leading-relaxed opacity-90">
          {article.lede}
        </p>
      ) : null}
      {cover ? (
        <WorkFrame
          src={cover}
          alt={article.title}
          fit="cover"
          className="mt-10 h-[22rem] w-full md:h-[28rem]"
        />
      ) : null}
      <div className="mt-10 flex flex-col gap-6">
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 48)}
            className="font-serif text-lg leading-relaxed opacity-90 whitespace-pre-wrap"
          >
            {paragraph}
          </p>
        ))}
      </div>
      <p className="mt-12 font-sans text-sm">
        <Link
          href={profilePath(article.author.slug)}
          className="text-[var(--accent)]"
        >
          {t('toAuthor', { name: article.author.displayName })}
        </Link>
      </p>
    </main>
  );
}
