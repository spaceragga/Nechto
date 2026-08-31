export function ProfileGlyph({
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
      {/* Hairline bust: head + open shoulder — a person, not a filled cameo. */}
      <circle cx="12" cy="7.5" r="3.1" vectorEffect="nonScalingStroke" />
      <path
        d="M5.2 19.8c.6-3.6 3.1-5.5 6.8-5.5s6.2 1.9 6.8 5.5"
        vectorEffect="nonScalingStroke"
      />
    </svg>
  );
}
