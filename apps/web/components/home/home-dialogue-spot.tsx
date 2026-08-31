import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

type HomeDialogueSpotProps = {
  kicker: string;
  title: string;
  lede: string;
  leftTitle: string;
  leftMeta: string;
  rightTitle: string;
  rightMeta: string;
  cta: string;
};

export function HomeDialogueSpot({
  kicker,
  title,
  lede,
  leftTitle,
  leftMeta,
  rightTitle,
  rightMeta,
  cta,
}: HomeDialogueSpotProps) {
  return (
    <article>
      <Link href="/collections" className="flex min-w-0 flex-col">
        <div className="grid grid-cols-2 gap-1">
          <div className="min-w-0">
            <WorkFrame still="glass" alt={leftTitle} className="h-32 w-full" />
            <p className="mt-2 truncate font-serif text-sm">{leftTitle}</p>
            <p className="mt-0.5 font-serif text-xs opacity-70">{leftMeta}</p>
          </div>
          <div className="min-w-0">
            <WorkFrame still="stair" alt={rightTitle} className="h-32 w-full" />
            <p className="mt-2 truncate font-serif text-sm">{rightTitle}</p>
            <p className="mt-0.5 font-serif text-xs opacity-70">{rightMeta}</p>
          </div>
        </div>
        <p className="mt-2 font-sans text-xs tracking-[0.2em] uppercase opacity-80">
          {kicker}
        </p>
        <h2 className="mt-1 font-serif text-2xl tracking-wide">{title}</h2>
        <p className="mt-1 font-serif text-sm opacity-70">{lede}</p>
        <span className="mt-2 font-sans text-sm text-[var(--accent)]">
          {cta}
        </span>
      </Link>
    </article>
  );
}
