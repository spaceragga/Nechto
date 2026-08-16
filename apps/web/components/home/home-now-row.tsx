import { Link } from '@/i18n/navigation';
import { FluidRail } from '@/components/ui/fluid-rail';
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
    <div className="flex h-28 gap-2 overflow-hidden">
      <Link
        href={DEMO_PROFILE_HREF}
        className="flex w-28 shrink-0 flex-col justify-end overflow-hidden rounded border border-white/15 bg-[var(--bg)] px-2 py-1.5 hover:bg-white/5"
      >
        <span className="text-sm leading-tight">{item.author}</span>
        <span className="mt-0.5 text-[11px] leading-tight opacity-70">
          {item.directionLabel}
        </span>
      </Link>
      <FluidRail minItem="7.5rem" gap="0.5rem" className="min-w-0 flex-1">
        {item.works.map((work) => (
          <Link
            key={work.title}
            href={DEMO_PROFILE_HREF}
            className="flex min-h-0 flex-col overflow-hidden rounded border border-white/15 bg-[var(--bg)] hover:bg-white/5"
          >
            <span className="min-h-0 flex-1 bg-white/10" />
            <span className="truncate px-1.5 py-1 text-[11px] leading-tight">
              {work.title}
            </span>
          </Link>
        ))}
      </FluidRail>
    </div>
  );
}
