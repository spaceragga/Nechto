export function LoginGlyph({
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
      {/* Same doorway as logout; arrow enters instead of leaving. */}
      <path
        d="M10 4.5H5.75a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1H10"
        vectorEffect="nonScalingStroke"
      />
      <path d="M21.5 12H11" vectorEffect="nonScalingStroke" />
      <path d="M14.8 8.4 10.5 12l4.3 3.6" vectorEffect="nonScalingStroke" />
    </svg>
  );
}
