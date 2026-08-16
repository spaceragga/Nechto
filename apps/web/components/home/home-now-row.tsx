import { Link } from '@/i18n/navigation';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';

export type HomeNowItem = {
  author: string;
  directionLabel: string;
  works: { title: string }[];
};

type HomeNowRowProps = {
  item: HomeNowItem;
};

export function HomeNowRow({ item }: HomeNowRowProps) {
  return (
    <div className="grid h-28 grid-cols-4 gap-2">
      <Link
        href={DEMO_PROFILE_HREF}
        className="flex flex-col justify-end overflow-hidden rounded border border-white/15 bg-[var(--bg)] px-2 py-1.5 hover:bg-white/5"
      >
        <span className="text-sm leading-tight">{item.author}</span>
        <span className="mt-0.5 text-[11px] leading-tight opacity-70">
          {item.directionLabel}
        </span>
      </Link>
      {item.works.map((work) => (
        <Link
          key={work.title}
          href={DEMO_PROFILE_HREF}
          className="flex flex-col overflow-hidden rounded border border-white/15 bg-[var(--bg)] hover:bg-white/5"
        >
          <span className="min-h-0 flex-1 bg-white/10" />
          <span className="truncate px-1.5 py-1 text-[11px] leading-tight">
            {work.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
