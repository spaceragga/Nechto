'use client';

import type { ReactNode } from 'react';

type HoverTipProps = {
  label: string;
  align?: 'end' | 'center';
  children: ReactNode;
};

export function HoverTip({ label, align = 'end', children }: HoverTipProps) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-[calc(100%+0.4rem)] z-30 whitespace-nowrap border border-white/20 bg-[var(--bg)] px-2 py-1 text-xs tracking-wide opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 ${
          align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'
        }`}
      >
        {label}
      </span>
    </span>
  );
}
