import { HairlineSvg } from '@/components/glyphs/hairline-svg';

export function HeartGlyph({
  filled = false,
  className = 'h-8 w-8',
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <HairlineSvg viewBox="0 0 24 24" className={className}>
      <path
        d="M12 19.4s-7.4-4.5-7.4-9.2A3.8 3.8 0 0 1 12 7.2a3.8 3.8 0 0 1 7.4 3c0 4.7-7.4 9.2-7.4 9.2Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </HairlineSvg>
  );
}
