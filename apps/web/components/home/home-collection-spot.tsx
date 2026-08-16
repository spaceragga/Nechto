import { DemoStill, type DemoStillKind } from '@/components/ui/demo-still';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

const MOSAIC: DemoStillKind[] = ['courtyard', 'window', 'door', 'interior'];

type HomeCollectionSpotProps = {
  kicker: string;
  title: string;
  meta: string;
};

export function HomeCollectionSpot({
  kicker,
  title,
  meta,
}: HomeCollectionSpotProps) {
  return (
    <article>
      <Link href="/collections" className="flex min-w-0 flex-col">
        <div className="grid grid-cols-2 gap-1">
          {MOSAIC.map((kind) => (
            <WorkFrame key={kind} ratio="1/1" className="aspect-square w-full">
              <DemoStill kind={kind} />
            </WorkFrame>
          ))}
        </div>
        <p className="mt-3 font-sans text-xs tracking-[0.2em] uppercase opacity-80">
          {kicker}
        </p>
        <h2 className="mt-1 font-serif text-2xl tracking-wide">{title}</h2>
        <p className="mt-1 font-serif text-sm opacity-70">{meta}</p>
      </Link>
    </article>
  );
}
