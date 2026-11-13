import { FluidRail } from '@/components/ui/fluid-rail';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

export type HomeNowWork = {
  title: string;
  href: string;
  src?: string | null;
};

export type HomeNowItem = {
  id: string;
  author: string;
  href: string;
  directionLabel: string;
  directionHref?: string | null;
  avatarSrc?: string | null;
  works: HomeNowWork[];
};

type HomeNowRowProps = {
  item: HomeNowItem;
};

export function HomeNowRow({ item }: HomeNowRowProps) {
  return (
    <div className="relative flex h-36 shrink-0 gap-1 overflow-hidden">
      <div className="peer/author flex w-28 shrink-0 flex-col px-1 py-1">
        <Link href={item.href} className="flex flex-col">
          <WorkFrame
            src={item.avatarSrc}
            alt=""
            fit="cover"
            className="size-[60px] shrink-0"
          />
          <span className="mt-1 font-serif text-sm leading-tight">
            {item.author}
          </span>
        </Link>
        {item.directionHref ? (
          <Link
            href={item.directionHref}
            className="home-credit mt-0.5 font-sans text-xs leading-tight"
          >
            {item.directionLabel}
          </Link>
        ) : null}
      </div>
      <FluidRail
        minItem="7.5rem"
        gap="0.25rem"
        className="min-h-0 min-w-0 flex-1"
      >
        {item.works.map((work, index) => (
          <div
            key={`${work.href}:${work.title}:${index}`}
            className="flex min-h-0 flex-col"
          >
            <Link href={work.href} className="block min-h-0 flex-1">
              <WorkFrame
                src={work.src}
                alt={work.title}
                fit="cover"
                className="h-full min-h-0 w-full"
              />
            </Link>
            <span className="truncate pt-0.5 font-serif text-xs leading-tight">
              {work.title}
            </span>
          </div>
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
