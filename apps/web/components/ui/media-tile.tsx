import type { ReactNode } from 'react';
import { DemoStill, type DemoStillKind } from '@/components/ui/demo-still';
import { WorkCaption } from '@/components/ui/work-caption';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

type MediaTileProps = {
  href: string;
  title?: string;
  subtitle?: string;
  still?: DemoStillKind;
  ratio?: string;
  wellClassName?: string;
  className?: string;
  children?: ReactNode;
};

export function MediaTile({
  href,
  title,
  subtitle,
  still = 'interior',
  ratio = '4/3',
  wellClassName = 'h-44 w-full',
  className = '',
  children,
}: MediaTileProps) {
  return (
    <Link href={href} className={`block min-w-0 ${className}`.trim()}>
      <WorkFrame ratio={ratio} className={wellClassName}>
        {children ?? <DemoStill kind={still} />}
      </WorkFrame>
      <WorkCaption title={title} meta={subtitle} />
    </Link>
  );
}
