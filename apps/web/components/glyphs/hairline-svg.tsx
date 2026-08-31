import type { ReactNode } from 'react';

type HairlineSvgProps = {
  viewBox: string;
  className: string;
  children: ReactNode;
};

export function HairlineSvg({
  viewBox,
  className,
  children,
}: HairlineSvgProps) {
  return (
    <svg
      viewBox={viewBox}
      className={`pointer-events-none shrink-0 [&_circle]:[vector-effect:non-scaling-stroke] [&_path]:[vector-effect:non-scaling-stroke] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
      aria-hidden
    >
      {children}
    </svg>
  );
}
