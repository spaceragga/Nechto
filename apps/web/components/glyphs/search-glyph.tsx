import { HairlineSvg } from '@/components/glyphs/hairline-svg';

export function SearchGlyph({
  className = 'h-10 w-10',
}: {
  className?: string;
}) {
  return (
    <HairlineSvg viewBox="0 0 24 24" className={className}>
      <circle cx="10.5" cy="10.5" r="5.7" />
      <path d="m15.2 15.2 5 5" />
    </HairlineSvg>
  );
}
