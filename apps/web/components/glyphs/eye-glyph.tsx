import { HairlineSvg } from '@/components/glyphs/hairline-svg';

export function EyeGlyph({
  open,
  className = 'h-8 w-8',
}: {
  open: boolean;
  className?: string;
}) {
  return (
    <HairlineSvg viewBox="0 0 24 24" className={className}>
      <path d="M2.8 12s3.2-5.2 9.2-5.2S21.2 12 21.2 12 18 17.2 12 17.2 2.8 12 2.8 12Z" />
      {open ? <circle cx="12" cy="12" r="2.4" /> : <path d="m4 4 16 16" />}
    </HairlineSvg>
  );
}
