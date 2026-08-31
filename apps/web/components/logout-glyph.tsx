export function LogoutGlyph({
  className = 'h-10 w-10',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
      aria-hidden
    >
      {/* Open doorway + arrow leaving — exit, not a generic x. */}
      <path
        d="M10 4.5H5.75a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1H10"
        vectorEffect="nonScalingStroke"
      />
      <path d="M10.5 12h10" vectorEffect="nonScalingStroke" />
      <path d="M17.2 8.4 21.5 12l-4.3 3.6" vectorEffect="nonScalingStroke" />
    </svg>
  );
}
