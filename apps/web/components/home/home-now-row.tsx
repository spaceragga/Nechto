import { type DemoStillKind } from '@/lib/demo-media';
import { FluidRail } from '@/components/ui/fluid-rail';
import { WorkFrame } from '@/components/ui/work-frame';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';
import { Link } from '@/i18n/navigation';

export type HomeNowWork = {
  title: string;
  still?: DemoStillKind;
};

export type HomeNowItem = {
  author: string;
  directionLabel: string;
  works: HomeNowWork[];
};

type HomeNowRowProps = {
  item: HomeNowItem;
};

export function HomeNowRow({ item }: HomeNowRowProps) {
  return (
    <div className="relative flex min-h-28 flex-1 gap-2 overflow-hidden p-1">
      <Link
        href={DEMO_PROFILE_HREF}
        className="peer/author flex w-28 shrink-0 flex-col justify-end px-1 py-1.5"
      >
        <span className="font-serif text-sm leading-tight">{item.author}</span>
        <span className="mt-0.5 font-sans text-[11px] leading-tight opacity-70">
          {item.directionLabel}
        </span>
      </Link>
      <FluidRail minItem="7.5rem" gap="0.5rem" className="min-w-0 flex-1">
        {item.works.map((work) => (
          <Link
            key={work.title}
            href={DEMO_PROFILE_HREF}
            className="flex min-h-0 flex-col"
          >
            <WorkFrame
              still={work.still ?? 'interior'}
              alt={work.title}
              className="min-h-0 w-full flex-1"
            />
            <span className="truncate pt-1 font-serif text-[11px] leading-tight">
              {work.title}
            </span>
          </Link>
        ))}
      </FluidRail>
      <div
        aria-hidden
        data-now-row-outline
        className="pointer-events-none absolute inset-0 border border-transparent peer-hover/author:border-[var(--hover-outline)]"
      />
    </div>
  );
}
