import { HairlineSvg } from '@/components/glyphs/hairline-svg';

export function BellGlyph({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <HairlineSvg viewBox="0 0 24 24" className={className}>
      <path d="M4.6 17.2h14.8" />
      <path d="M5.8 17.2V10.4a6.2 6.2 0 0 1 12.4 0v6.8" />
      <path d="M9.4 17.2a2.6 2.6 0 0 0 5.2 0" />
      <path d="M12 3.2v1.6" />
    </HairlineSvg>
  );
}
