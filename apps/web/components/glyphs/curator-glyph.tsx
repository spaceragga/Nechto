import { HairlineSvg } from '@/components/glyphs/hairline-svg';

export function CuratorGlyph({
  className = 'h-10 w-10',
}: {
  className?: string;
}) {
  return (
    <HairlineSvg viewBox="0 0 24 24" className={className}>
      <rect x="3.4" y="5.2" width="11.2" height="13.6" rx="0.6" />
      <rect x="9.4" y="5.2" width="11.2" height="13.6" rx="0.6" />
    </HairlineSvg>
  );
}
