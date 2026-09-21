import { HairlineSvg } from '@/components/glyphs/hairline-svg';

export function GearGlyph({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <HairlineSvg viewBox="0 0 24 24" className={className}>
      <path d="M10.35 6.91 10.33 3.41 13.67 3.41 13.65 6.91 15.58 8.02 18.6 6.26 20.27 9.15 17.23 10.89 17.23 13.11 20.27 14.85 18.6 17.74 15.58 15.98 13.65 17.09 13.67 20.59 10.33 20.59 10.35 17.09 8.42 15.98 5.4 17.74 3.73 14.85 6.77 13.11 6.77 10.89 3.73 9.15 5.4 6.26 8.42 8.02Z" />
      <circle cx="12" cy="12" r="2.7" />
    </HairlineSvg>
  );
}
