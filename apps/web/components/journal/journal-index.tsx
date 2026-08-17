import { MediaTile } from '@/components/ui/media-tile';
import type { DemoStillKind } from '@/lib/demo-media';
import { DEMO_PROFILE_HREF } from '@/lib/creator-directions';

export type JournalIssue = {
  kicker: string;
  title: string;
  meta: string;
  still: DemoStillKind;
};

type JournalIndexProps = {
  title: string;
  lede: string;
  issues: JournalIssue[];
};

export function JournalIndex({ title, lede, issues }: JournalIndexProps) {
  const [featured, ...rest] = issues;

  return (
    <main className="flex w-full flex-col gap-10 px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm opacity-70">{lede}</p>
      </header>

      {featured ? (
        <MediaTile
          href={DEMO_PROFILE_HREF}
          title={featured.title}
          subtitle={`${featured.kicker} · ${featured.meta}`}
          still={featured.still}
          wellClassName="h-64 w-full md:h-80"
        />
      ) : null}

      {rest.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((issue) => (
            <MediaTile
              key={issue.title}
              href={DEMO_PROFILE_HREF}
              title={issue.title}
              subtitle={`${issue.kicker} · ${issue.meta}`}
              still={issue.still}
            />
          ))}
        </div>
      ) : null}
    </main>
  );
}
