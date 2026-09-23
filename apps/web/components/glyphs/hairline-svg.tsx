import type { ReactNode } from 'react';

const HAIRLINE_STROKE =
  '[&_circle]:[vector-effect:non-scaling-stroke] [&_ellipse]:[vector-effect:non-scaling-stroke] [&_line]:[vector-effect:non-scaling-stroke] [&_path]:[vector-effect:non-scaling-stroke] [&_polygon]:[vector-effect:non-scaling-stroke] [&_polyline]:[vector-effect:non-scaling-stroke] [&_rect]:[vector-effect:non-scaling-stroke]';

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
      className={`pointer-events-none shrink-0 ${HAIRLINE_STROKE} ${className}`}
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
