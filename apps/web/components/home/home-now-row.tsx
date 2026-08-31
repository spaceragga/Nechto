import { type DemoStillKind } from '@/lib/demo-media';
import { FluidRail } from '@/components/ui/fluid-rail';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

export type HomeNowWork = {
  title: string;
  href: string;
  still?: DemoStillKind;
  src?: string | null;
};

export type HomeNowItem = {
  author: string;
  href: string;
  directionLabel: string;
  avatarStill?: DemoStillKind;
  avatarSrc?: string | null;
  works: HomeNowWork[];
};

type HomeNowRowProps = {
  item: HomeNowItem;
};

export function HomeNowRow({ item }: HomeNowRowProps) {
  return (
    <div className="relative flex h-36 shrink-0 gap-1 overflow-hidden">
      <Link
        href={item.href}
        className="peer/author flex w-28 shrink-0 flex-col px-1 py-1"
      >
        <WorkFrame
          still={item.avatarStill}
          src={item.avatarSrc}
          alt=""
          fit="cover"
          className="size-[60px] shrink-0"
        />
        <span className="mt-1 font-serif text-sm leading-tight">
          {item.author}
        </span>
        <span className="mt-0.5 font-sans text-[11px] leading-tight opacity-70">
          {item.directionLabel}
        </span>
      </Link>
      <FluidRail
        minItem="7.5rem"
        gap="0.25rem"
        className="min-h-0 min-w-0 flex-1"
      >
        {item.works.map((work) => (
          <Link
            key={work.title}
            href={work.href}
            className="flex min-h-0 flex-col"
          >
            <WorkFrame
              still={work.still}
              src={work.src}
              alt={work.title}
              fit="cover"
              className="min-h-0 w-full flex-1"
            />
            <span className="truncate pt-0.5 font-serif text-[11px] leading-tight">
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
