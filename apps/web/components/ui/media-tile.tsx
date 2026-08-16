import { type DemoStillKind } from '@/lib/demo-media';
import { WorkCaption } from '@/components/ui/work-caption';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

type MediaTileProps = {
  href: string;
  title?: string;
  subtitle?: string;
  still?: DemoStillKind;
  src?: string | null;
  wellClassName?: string;
  className?: string;
};

export function MediaTile({
  href,
  title,
  subtitle,
  still = 'interior',
  src,
  wellClassName = 'h-44 w-full',
  className = '',
}: MediaTileProps) {
  return (
    <Link href={href} className={`block min-w-0 ${className}`.trim()}>
      <WorkFrame
        src={src}
        still={still}
        alt={title ?? ''}
        className={wellClassName}
      />
      <WorkCaption title={title} meta={subtitle} />
    </Link>
  );
}
