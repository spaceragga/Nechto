import { WorkCaption } from '@/components/ui/work-caption';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

type MediaTileProps = {
  href: string;
  title?: string;
  subtitle?: string;
  src?: string | null;
  wellClassName?: string;
  className?: string;
  fit?: 'contain' | 'cover';
  captionSize?: 'sm' | 'md';
};

export function MediaTile({
  href,
  title,
  subtitle,
  src,
  wellClassName = 'h-44 w-full',
  className = '',
  fit = 'cover',
  captionSize = 'md',
}: MediaTileProps) {
  return (
    <Link href={href} className={`group block min-w-0 ${className}`.trim()}>
      <WorkFrame
        src={src}
        alt={title ?? ''}
        className={wellClassName}
        fit={fit}
      />
      <WorkCaption title={title} meta={subtitle} size={captionSize} />
    </Link>
  );
}
