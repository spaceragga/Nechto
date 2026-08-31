import type { CSSProperties, ReactNode } from 'react';

type FluidRailProps = {
  children: ReactNode;
  minItem?: string;
  gap?: string;
  className?: string;
  grow?: boolean;
};

export function FluidRail({
  children,
  minItem = '14rem',
  gap = '0.75rem',
  className = '',
  grow = true,
}: FluidRailProps) {
  return (
    <div
      className={`fluid-rail ${className}`.trim()}
      data-grow={grow ? undefined : 'false'}
      style={
        {
          '--fluid-min': minItem,
          '--fluid-gap': gap,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
