'use client';

import { useLayoutEffect } from 'react';
import {
  clearPreservedScroll,
  readPreservedScroll,
} from '@/lib/preserve-scroll';

type QueryScrollLockProps = {
  token: string;
};

export function QueryScrollLock({ token }: QueryScrollLockProps) {
  useLayoutEffect(() => {
    const top = readPreservedScroll();
    if (top == null) {
      return;
    }
    const restore = () => window.scrollTo({ top, behavior: 'instant' });
    restore();
    const frame = requestAnimationFrame(restore);
    const later = window.setTimeout(restore, 0);
    const afterNav = window.setTimeout(() => {
      restore();
      clearPreservedScroll();
    }, 120);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(later);
      window.clearTimeout(afterNav);
    };
  }, [token]);

  return null;
}
