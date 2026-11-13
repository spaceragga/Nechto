import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

type HomeSpotRootProps = {
  spot?: string;
  className: string;
  children: ReactNode;
};

/** The spot is not one link. Pictures, names, and buttons each go somewhere. */
export function HomeSpotRoot({ spot, className, children }: HomeSpotRootProps) {
  return (
    <div data-home-spot={spot} className={className}>
      {children}
    </div>
  );
}

type HomeStillProps = {
  href?: string | null;
  className?: string;
  children: ReactNode;
};

/** The picture is the hit target. Motion stays inside the frame. */
export function HomeStill({ href, className, children }: HomeStillProps) {
  if (!href) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Link href={href} className={`block ${className ?? ''}`.trim()}>
      {children}
    </Link>
  );
}
