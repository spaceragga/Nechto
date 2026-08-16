import { DemoStill, type DemoStillKind } from '@/components/ui/demo-still';
import { WorkFrame } from '@/components/ui/work-frame';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';
import { Link } from '@/i18n/navigation';

export type HomeFreshItem = {
  title: string;
  author: string;
  time: string;
  still: DemoStillKind;
};

type HomeFreshSpotProps = {
  kicker: string;
  seeAll: string;
  items: HomeFreshItem[];
};

export function HomeFreshSpot({ kicker, seeAll, items }: HomeFreshSpotProps) {
  return (
    <article>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-sans text-xs tracking-[0.2em] uppercase opacity-80">
          {kicker}
        </h2>
        <Link href="/new" className="font-sans text-sm text-[var(--accent)]">
          {seeAll}
        </Link>
      </div>
      <ul className="flex flex-col">
        {items.map((item, index) => (
          <li
            key={item.title}
            className={index === 0 ? '' : 'border-t border-white/15'}
          >
            <Link
              href={DEMO_PROFILE_HREF}
              className="flex items-center gap-3 py-3"
            >
              <WorkFrame ratio="4/3" className="h-14 w-16 shrink-0">
                <DemoStill kind={item.still} />
              </WorkFrame>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-sm">{item.title}</p>
                <p className="mt-0.5 font-serif text-xs opacity-70">
                  {item.author}
                </p>
              </div>
              <span className="shrink-0 font-sans text-xs opacity-50">
                {item.time}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
