import { type DemoStillKind } from '@/lib/demo-media';
import { WorkCaption } from '@/components/ui/work-caption';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

export const CREATOR_CARD_WORK_SLOTS = 4;

export type CreatorCardWork = {
  src?: string | null;
  still?: DemoStillKind;
  alt?: string;
};

type CreatorCardProps = {
  href: string;
  name: string;
  directionLabel?: string;
  portraitSrc?: string | null;
  portraitStill?: DemoStillKind;
  works: CreatorCardWork[];
};

function workSlots(works: CreatorCardWork[]): CreatorCardWork[] {
  const slots = works.slice(0, CREATOR_CARD_WORK_SLOTS);
  while (slots.length < CREATOR_CARD_WORK_SLOTS) {
    slots.push({});
  }
  return slots;
}

export function CreatorCard({
  href,
  name,
  directionLabel,
  portraitSrc,
  portraitStill,
  works,
}: CreatorCardProps) {
  return (
    <Link href={href} data-creator-card className="block min-w-0">
      <div className="grid aspect-5/3 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-1">
        <div data-creator-portrait className="min-h-0">
          <WorkFrame
            src={portraitSrc}
            still={portraitStill}
            alt={name}
            fit="cover"
            className="h-full w-full"
          />
        </div>
        <div className="grid min-h-0 grid-cols-2 grid-rows-2 gap-1">
          {workSlots(works).map((work, index) => (
            <div key={index} data-creator-work className="min-h-0">
              <WorkFrame
                src={work.src}
                still={work.still}
                alt={work.alt ?? ''}
                fit="cover"
                className="h-full w-full"
              />
            </div>
          ))}
        </div>
      </div>
      <WorkCaption title={name} meta={directionLabel} />
    </Link>
  );
}
