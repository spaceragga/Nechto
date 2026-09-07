import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

type HomeSpotRootProps = {
  href?: string | null;
  spot?: string;
  className: string;
  children: ReactNode;
};

export function HomeSpotRoot({
  href,
  spot,
  className,
  children,
}: HomeSpotRootProps) {
  if (href) {
    return (
      <Link href={href} data-home-spot={spot} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <div data-home-spot={spot} className={className}>
      {children}
    </div>
  );
}
