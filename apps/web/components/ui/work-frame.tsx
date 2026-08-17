import { type DemoStillKind, demoMediaSrc } from '@/lib/demo-media';
import { toUploadSrc } from '@/lib/to-upload-src';

type WorkFrameProps = {
  src?: string | null;
  still?: DemoStillKind;
  alt?: string;
  className?: string;
  fit?: 'contain' | 'cover';
};

export function WorkFrame({
  src,
  still,
  alt = '',
  className = '',
  fit = 'contain',
}: WorkFrameProps) {
  const resolved = src ?? (still ? demoMediaSrc(still) : null);
  const imageSrc = resolved ? (toUploadSrc(resolved) ?? resolved) : null;

  return (
    <div
      data-work-frame
      data-still-src={imageSrc ?? undefined}
      className={`${
        fit === 'cover'
          ? 'overflow-hidden bg-[var(--bg)]'
          : 'flex items-center justify-center overflow-hidden bg-[var(--bg)]'
      } ${className}`.trim()}
    >
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- same path as StorageService public URLs
        <img
          src={imageSrc}
          alt={alt}
          className={
            fit === 'cover'
              ? 'block h-full w-full object-cover'
              : 'max-h-full max-w-full object-contain'
          }
        />
      ) : null}
    </div>
  );
}
