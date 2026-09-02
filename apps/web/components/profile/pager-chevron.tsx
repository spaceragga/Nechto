export function PagerChevron({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg
      viewBox="0 0 16 48"
      className="pointer-events-none aspect-[1/3] h-[6.75rem] overflow-visible"
      shapeRendering="geometricPrecision"
      aria-hidden
    >
      {/* Hairline strokes alias as ribbing; a filled strip anti-aliases evenly. */}
      <path
        d="M4.42 3.83 12.48 24 4.42 44.17 3.58 43.83 11.52 24 3.58 4.17Z"
        fill="currentColor"
        transform={
          direction === 'prev' ? 'scale(-1 1) translate(-16 0)' : undefined
        }
      />
    </svg>
  );
}
