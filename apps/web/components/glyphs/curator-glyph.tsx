import { HairlineSvg } from '@/components/glyphs/hairline-svg';

export function CuratorGlyph({
  className = 'h-10 w-10',
}: {
  className?: string;
}) {
  return (
    <HairlineSvg viewBox="0 0 24 24" className={className}>
      <path d="M12 3.4 19.4 6.2v6.1c0 4.4-3 6.9-7.4 8.3-4.4-1.4-7.4-3.9-7.4-8.3V6.2Z" />
      <circle cx="12" cy="10.3" r="2.15" />
      <path d="M8.15 17.55c.5-2.4 2-3.6 3.85-3.6s3.35 1.2 3.85 3.6" />
    </HairlineSvg>
  );
}
