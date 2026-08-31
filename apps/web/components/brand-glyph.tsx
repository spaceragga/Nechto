export function BrandGlyph({
  className = 'aspect-[11/3] h-10',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 88 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
      aria-hidden
    >
      {/* Hairline wordmark: same stroke as the header glyphs, no fill. */}
      <path d="M4 19V5" vectorEffect="nonScalingStroke" />
      <path d="M4 5 15 19" vectorEffect="nonScalingStroke" />
      <path d="M15 19V5" vectorEffect="nonScalingStroke" />
      <path
        d="M30.4 11.4c-.9-2.2-2.7-3.5-5.1-3.5-3.1 0-5.5 2.4-5.5 5.4s2.4 5.4 5.5 5.4c2.3 0 4.2-1.2 5-2.9"
        vectorEffect="nonScalingStroke"
      />
      <path d="M19.8 14h10.8" vectorEffect="nonScalingStroke" />
      <path
        d="M44.8 11.4c-.9-2.2-2.7-3.5-5.1-3.5-3.1 0-5.5 2.4-5.5 5.4s2.4 5.4 5.5 5.4c2.3 0 4.2-1.2 5-2.9"
        vectorEffect="nonScalingStroke"
      />
      <path d="M48.5 19V5" vectorEffect="nonScalingStroke" />
      <path
        d="M48.5 13.8c1-3.1 3.4-4.9 6.4-4.9 3.2 0 5.6 2.4 5.6 5.5V19"
        vectorEffect="nonScalingStroke"
      />
      <path
        d="M66.2 5v12.4c0 1.6 1.15 2.3 2.9 2.3"
        vectorEffect="nonScalingStroke"
      />
      <path d="M61.2 9h10.2" vectorEffect="nonScalingStroke" />
      <circle cx="80.2" cy="14" r="5.25" vectorEffect="nonScalingStroke" />
    </svg>
  );
}
