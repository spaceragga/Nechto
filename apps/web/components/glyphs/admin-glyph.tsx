import { HairlineSvg } from '@/components/glyphs/hairline-svg';

export function AdminGlyph({
  className = 'h-10 w-10',
}: {
  className?: string;
}) {
  return (
    <HairlineSvg viewBox="0 0 24 24" className={className}>
      <path d="M12 3.4 19.4 6.2v6.1c0 4.4-3 6.9-7.4 8.3-4.4-1.4-7.4-3.9-7.4-8.3V6.2Z" />
      <circle cx="12" cy="11.55" r="2.05" />
      <path d="M12 8.7V7.45M14.48 10.12l1.08-.62M14.48 12.98l1.08.62M12 14.4v1.25M9.52 12.98l-1.08.62M9.52 10.12l-1.08-.62" />
    </HairlineSvg>
  );
}
