import { WorkFrame } from '@/components/ui/work-frame';

const THUMB_SIZE = {
  sm: 'size-10',
  md: 'size-16',
  lg: 'size-24',
} as const;

type ThumbSize = keyof typeof THUMB_SIZE;

type StaffThumbProps = {
  src?: string | null;
  alt?: string;
  size?: ThumbSize;
  className?: string;
};

/** Compact cover thumb for staff desk rows. */
export function StaffThumb({
  src,
  alt = '',
  size = 'sm',
  className = '',
}: StaffThumbProps) {
  return (
    <WorkFrame
      src={src}
      alt={alt}
      fit="cover"
      staticFrame
      className={`${THUMB_SIZE[size]} shrink-0 bg-white/5 ${className}`.trim()}
    />
  );
}

type StaffThumbPairProps = {
  leftSrc?: string | null;
  rightSrc?: string | null;
  leftAlt?: string;
  rightAlt?: string;
  size?: ThumbSize;
};

export function StaffThumbPair({
  leftSrc,
  rightSrc,
  leftAlt = '',
  rightAlt = '',
  size = 'sm',
}: StaffThumbPairProps) {
  const overlap = size === 'lg' ? '-ml-4' : size === 'md' ? '-ml-3' : '-ml-2';
  return (
    <span className="flex shrink-0">
      <StaffThumb src={leftSrc} alt={leftAlt} size={size} />
      <StaffThumb
        src={rightSrc}
        alt={rightAlt}
        size={size}
        className={`${overlap} ring-1 ring-[var(--bg)]`}
      />
    </span>
  );
}
