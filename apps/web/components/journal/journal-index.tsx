import { MediaTile } from '@/components/ui/media-tile';
import { excerpt } from '@/lib/excerpt';

export type JournalCard = {
  href: string;
  title: string;
  meta: string;
  lede: string;
  src?: string | null;
};

type JournalIndexProps = {
  title: string;
  lede: string;
  empty?: string;
  articles: JournalCard[];
};

export function JournalIndex({
  title,
  lede,
  empty,
  articles,
}: JournalIndexProps) {
  const [featured, ...rest] = articles;

  return (
    <main className="flex w-full flex-col gap-10 px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm opacity-70">{lede}</p>
      </header>

      {featured ? (
        <article className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <MediaTile
            href={featured.href}
            title={featured.title}
            subtitle={featured.meta}
            src={featured.src}
            wellClassName="h-72 w-full md:h-[28rem]"
          />
          <div className="max-w-md">
            <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-70">
              {featured.meta}
            </p>
            <p className="mt-4 font-serif text-base leading-relaxed opacity-90">
              {excerpt(featured.lede, 220) || featured.title}
            </p>
          </div>
        </article>
      ) : empty ? (
        <p className="text-sm opacity-70">{empty}</p>
      ) : null}

      {rest.length > 0 ? (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <MediaTile
              key={article.href}
              href={article.href}
              title={article.title}
              subtitle={`${article.meta}${
                article.lede ? ` · ${excerpt(article.lede, 80)}` : ''
              }`}
              src={article.src}
            />
          ))}
        </div>
      ) : null}
    </main>
  );
}
