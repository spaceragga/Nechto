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
        <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed opacity-70">
          {lede}
        </p>
      </header>

      {featured ? (
        <article className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <MediaTile
            href={featured.href}
            title={featured.title}
            subtitle={featured.meta}
            src={featured.src}
            wellClassName="aspect-[3/2] w-full md:aspect-auto md:h-[28rem]"
          />
          <div className="max-w-md">
            <p className="font-sans text-sm tracking-[0.16em] uppercase opacity-70">
              {featured.meta}
            </p>
            <p className="mt-4 font-serif text-lg leading-relaxed opacity-90">
              {excerpt(featured.lede, 220) || featured.title}
            </p>
          </div>
        </article>
      ) : empty ? (
        <p className="text-base opacity-70">{empty}</p>
      ) : null}

      {rest.length > 0 ? (
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {rest.map((article) => (
            <MediaTile
              key={article.href}
              href={article.href}
              title={article.title}
              subtitle={`${article.meta}${
                article.lede ? ` · ${excerpt(article.lede, 80)}` : ''
              }`}
              src={article.src}
              wellClassName="aspect-[3/2] w-full"
            />
          ))}
        </div>
      ) : null}
    </main>
  );
}
