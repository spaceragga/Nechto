import { HairlineSvg } from '@/components/glyphs/hairline-svg';

export function BrandGlyph({
  className = 'aspect-[11/3] h-10',
}: {
  className?: string;
}) {
  return (
    <HairlineSvg viewBox="0 0 88 24" className={className}>
      <path d="M4 19V5" />
      <path d="M4 5 15 19" />
      <path d="M15 19V5" />
      <path d="M30.4 11.4c-.9-2.2-2.7-3.5-5.1-3.5-3.1 0-5.5 2.4-5.5 5.4s2.4 5.4 5.5 5.4c2.3 0 4.2-1.2 5-2.9" />
      <path d="M19.8 14h10.8" />
      <path d="M44.8 11.4c-.9-2.2-2.7-3.5-5.1-3.5-3.1 0-5.5 2.4-5.5 5.4s2.4 5.4 5.5 5.4c2.3 0 4.2-1.2 5-2.9" />
      <path d="M48.5 19V5" />
      <path d="M48.5 13.8c1-3.1 3.4-4.9 6.4-4.9 3.2 0 5.6 2.4 5.6 5.5V19" />
      <path d="M66.2 5v12.4c0 1.6 1.15 2.3 2.9 2.3" />
      <path d="M61.2 9h10.2" />
      <circle cx="80.2" cy="14" r="5.25" />
    </HairlineSvg>
  );
}
