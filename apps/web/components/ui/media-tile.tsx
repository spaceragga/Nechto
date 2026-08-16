import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

type MediaTileProps = {
  href: string;
  title?: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
};

export function MediaTile({
  href,
  title,
  subtitle,
  className = '',
  children,
}: MediaTileProps) {
  return (
    <Link
      href={href}
      className={`block overflow-hidden rounded border border-white/15 bg-white/5 ${className}`}
    >
      {children ?? <div className="aspect-[4/3] bg-white/10" />}
      {title ? <p className="px-3 pt-2 text-sm">{title}</p> : null}
      {subtitle ? (
        <p className="px-3 pt-1 pb-2 text-xs opacity-70">{subtitle}</p>
      ) : title ? (
        <div className="pb-2" />
      ) : null}
    </Link>
  );
}
