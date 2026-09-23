import { HairlineSvg } from '@/components/glyphs/hairline-svg';

export function ShieldGlyph({
  className = 'h-10 w-10',
}: {
  className?: string;
}) {
  return (
    <HairlineSvg viewBox="0 0 24 24" className={className}>
      <path d="M12 3.4 19.4 6.2v6.1c0 4.4-3 6.9-7.4 8.3-4.4-1.4-7.4-3.9-7.4-8.3V6.2Z" />
      <path d="M9.2 12.1 11.1 14l3.7-4.2" />
    </HairlineSvg>
  );
}
