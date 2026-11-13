import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

export type HomeFreshItem = {
  title: string;
  author: string;
  authorHref?: string | null;
  time: string;
  href: string;
  src?: string | null;
};

type HomeFreshSpotProps = {
  kicker: string;
  seeAll: string;
  pending: string;
  items: HomeFreshItem[];
};

export function HomeFreshSpot({
  kicker,
  seeAll,
  pending,
  items,
}: HomeFreshSpotProps) {
  return (
    <article>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="font-sans text-sm tracking-[0.16em] uppercase opacity-80">
          {kicker}
        </h2>
        <Link href="/new" className="accent-mark">
          {seeAll}
        </Link>
      </div>
      {items.length > 0 ? (
        <ul className="flex flex-col">
          {items.map((item, index) => (
            <li
              key={`${item.href}-${item.title}`}
              className={`flex items-center gap-3 py-3 ${
                index === 0 ? '' : 'border-t border-white/15'
              }`}
            >
              <Link href={item.href} className="shrink-0">
                <WorkFrame
                  src={item.src}
                  alt={item.title}
                  fit="cover"
                  className="h-30 w-[10.5rem]"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-base">{item.title}</p>
                {item.authorHref ? (
                  <Link
                    href={item.authorHref}
                    className="home-credit mt-0.5 inline-block max-w-full truncate font-serif text-sm"
                  >
                    {item.author}
                  </Link>
                ) : (
                  <p className="mt-0.5 truncate font-serif text-sm opacity-70">
                    {item.author}
                  </p>
                )}
              </div>
              <span className="shrink-0 font-sans text-sm opacity-50">
                {item.time}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-serif text-base opacity-70">{pending}</p>
      )}
    </article>
  );
}
