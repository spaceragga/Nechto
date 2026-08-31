import { HairlineSvg } from '@/components/glyphs/hairline-svg';

type DoorGlyphProps = {
  direction: 'in' | 'out';
  className?: string;
};

export function DoorGlyph({
  direction,
  className = 'h-10 w-10',
}: DoorGlyphProps) {
  return (
    <HairlineSvg viewBox="0 0 24 24" className={className}>
      <path d="M10 4.5H5.75a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1H10" />
      {direction === 'out' ? (
        <>
          <path d="M10.5 12h10" />
          <path d="M17.2 8.4 21.5 12l-4.3 3.6" />
        </>
      ) : (
        <>
          <path d="M21.5 12H11" />
          <path d="M14.8 8.4 10.5 12l4.3 3.6" />
        </>
      )}
    </HairlineSvg>
  );
}
