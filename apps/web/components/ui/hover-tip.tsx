import type { ReactNode } from 'react';

type HoverTipProps = {
  label: string;
  children: ReactNode;
};

export function HoverTip({ label, children }: HoverTipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute top-[calc(100%+0.4rem)] right-0 z-30 whitespace-nowrap border border-white/20 bg-[var(--bg)] px-2 py-1 text-xs tracking-wide opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
