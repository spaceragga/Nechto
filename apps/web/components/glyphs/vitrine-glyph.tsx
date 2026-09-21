import { HairlineSvg } from '@/components/glyphs/hairline-svg';

export function VitrineGlyph({
  className = 'h-10 w-10',
}: {
  className?: string;
}) {
  return (
    <HairlineSvg viewBox="0 0 24 24" className={className}>
      <path d="M9.5 3.8h5" />
      <path d="M12 3.8v3.2" />
      <path d="M6.5 7h11v13h-11z" />
    </HairlineSvg>
  );
}
