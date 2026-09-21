'use client';

import { useState } from 'react';
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
  const [failed, setFailed] = useState(false);
  const shown = imageSrc && !failed ? imageSrc : null;

  return (
    <div
      data-work-frame
      data-still-src={shown ?? undefined}
      className={`${
        fit === 'cover'
          ? 'overflow-hidden bg-[var(--bg)]'
          : 'flex items-center justify-center overflow-hidden bg-[var(--bg)]'
      } ${className}`.trim()}
    >
      {shown ? (
        // eslint-disable-next-line @next/next/no-img-element -- same path as StorageService public URLs
        <img
          src={shown}
          alt={alt}
          onError={() => setFailed(true)}
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
