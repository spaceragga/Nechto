import { HairlineSvg } from '@/components/glyphs/hairline-svg';

export function ProfileGlyph({
  className = 'h-10 w-10',
}: {
  className?: string;
}) {
  return (
    <HairlineSvg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="7.5" r="3.1" />
      <path d="M5.2 19.8c.6-3.6 3.1-5.5 6.8-5.5s6.2 1.9 6.8 5.5" />
    </HairlineSvg>
  );
}
