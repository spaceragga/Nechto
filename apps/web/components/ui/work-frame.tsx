'use client';

import { useEffect, useRef, useState } from 'react';
import { toUploadSrc } from '@/lib/to-upload-src';

type WorkFrameProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  fit?: 'contain' | 'cover';
  /** Disable hover motion (editors, tiny thumbs). */
  staticFrame?: boolean;
};

const EASE_IN =
  'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), filter 0.6s ease';
const EASE_TRACK = 'transform 0.35s ease-out, filter 0.4s ease';
const EASE_OUT =
  'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1), filter 0.7s ease';

/**
 * Cover stills: soft tilt + parallax + whisper of light.
 * Contain / static: no motion.
 */
export function WorkFrame({
  src,
  alt = '',
  className = '',
  fit = 'contain',
  staticFrame = false,
}: WorkFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const imageSrc = src ? (toUploadSrc(src) ?? src) : null;
  const [failed, setFailed] = useState(false);
  const shown = imageSrc && !failed ? imageSrc : null;
  const live = !staticFrame && fit === 'cover' && Boolean(shown);

  useEffect(() => {
    if (!live) {
      return;
    }
    const frame = frameRef.current;
    const image = imageRef.current;
    const light = lightRef.current;
    if (!frame || !image || !light) {
      return;
    }

    const root = frame.closest('a') ?? frame;
    let raf = 0;
    let inside = false;
    let pointerX = 0;
    let pointerY = 0;

    const reset = () => {
      image.style.transform =
        'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)';
      image.style.filter = 'brightness(1) contrast(1) saturate(1)';
      light.style.opacity = '0';
    };

    const paint = () => {
      raf = 0;
      if (!inside) {
        reset();
        return;
      }

      const rect = frame.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) {
        return;
      }

      const nx = (pointerX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const ny = (pointerY - (rect.top + rect.height / 2)) / (rect.height / 2);
      const x = Math.max(-1, Math.min(1, nx));
      const y = Math.max(-1, Math.min(1, ny));

      const rotY = x * 3;
      const rotX = y * -2.2;
      const tx = x * -1.8;
      const ty = y * -1.8;
      const spotX = ((x + 1) / 2) * 100;
      const spotY = ((y + 1) / 2) * 100;

      image.style.transform = `translate3d(${tx}%, ${ty}%, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.035)`;
      image.style.filter = 'brightness(1.03) contrast(1.015) saturate(1.02)';
      light.style.opacity = '1';
      light.style.background = `radial-gradient(circle at ${spotX}% ${spotY}%, rgb(255 255 255 / 10%) 0%, rgb(255 255 255 / 3%) 32%, transparent 62%)`;
    };

    const schedule = () => {
      if (!raf) {
        raf = window.requestAnimationFrame(paint);
      }
    };

    const enter = (event: Event) => {
      const pointer = event as PointerEvent;
      inside = true;
      pointerX = pointer.clientX;
      pointerY = pointer.clientY;
      image.style.transition = EASE_IN;
      light.style.transition = 'opacity 0.35s ease';
      schedule();
    };

    const move = (event: Event) => {
      if (!inside) {
        return;
      }
      const pointer = event as PointerEvent;
      pointerX = pointer.clientX;
      pointerY = pointer.clientY;
      image.style.transition = EASE_TRACK;
      schedule();
    };

    const leave = (event: Event) => {
      const related =
        'relatedTarget' in event
          ? (event as PointerEvent | FocusEvent).relatedTarget
          : null;
      if (related instanceof Node && root.contains(related)) {
        return;
      }
      inside = false;
      image.style.transition = EASE_OUT;
      light.style.transition = 'opacity 0.5s ease';
      schedule();
    };

    const focusIn = () => {
      inside = true;
      const rect = frame.getBoundingClientRect();
      pointerX = rect.left + rect.width / 2;
      pointerY = rect.top + rect.height / 2;
      image.style.transition = EASE_IN;
      light.style.transition = 'opacity 0.35s ease';
      schedule();
    };

    root.addEventListener('pointerenter', enter);
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', leave);
    root.addEventListener('focusin', focusIn);
    root.addEventListener('focusout', leave);

    image.style.transformStyle = 'preserve-3d';
    image.style.willChange = 'transform, filter';
    image.style.transition = EASE_OUT;
    light.style.transition = 'opacity 0.5s ease';
    reset();

    return () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
      root.removeEventListener('pointerenter', enter);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
      root.removeEventListener('focusin', focusIn);
      root.removeEventListener('focusout', leave);
      image.style.willChange = '';
      image.style.transform = '';
      image.style.filter = '';
      image.style.transition = '';
      image.style.transformStyle = '';
      light.style.opacity = '';
      light.style.background = '';
      light.style.transition = '';
    };
  }, [live, shown]);

  return (
    <div
      ref={frameRef}
      data-work-frame
      data-still-src={shown ?? undefined}
      className={`relative ${
        fit === 'cover'
          ? 'overflow-hidden bg-[var(--bg)]'
          : 'flex items-center justify-center overflow-hidden bg-[var(--bg)]'
      } ${className}`.trim()}
      style={live ? { perspective: '1200px' } : undefined}
    >
      {shown ? (
        // eslint-disable-next-line @next/next/no-img-element -- same path as StorageService public URLs
        <img
          ref={imageRef}
          src={shown}
          alt={alt}
          onError={() => setFailed(true)}
          className={
            fit === 'cover'
              ? 'block h-full w-full object-cover'
              : 'max-h-full max-w-full object-contain'
          }
          draggable={false}
        />
      ) : null}
      {live ? (
        <div
          ref={lightRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] mix-blend-soft-light"
          style={{ opacity: 0 }}
        />
      ) : null}
    </div>
  );
}
