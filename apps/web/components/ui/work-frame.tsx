import { toUploadSrc } from '@/lib/to-upload-src';

type WorkFrameProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  fit?: 'contain' | 'cover';
};

export function WorkFrame({
  src,
  alt = '',
  className = '',
  fit = 'contain',
}: WorkFrameProps) {
  const imageSrc = src ? (toUploadSrc(src) ?? src) : null;

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
