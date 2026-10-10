'use client';

import type { ReactNode } from 'react';
import { useId, useState } from 'react';

type StaffDeskProps = {
  title: string;
  /** Compact status shown in the closed header (counts, featured name). */
  meta?: string | null;
  lede?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function StaffDesk({
  title,
  meta,
  lede,
  defaultOpen = false,
  children,
}: StaffDeskProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="border-b border-white/10">
      <h2 className="m-0">
        <button
          type="button"
          className="flex w-full items-center gap-3 py-5 text-left"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
        >
          <span
            aria-hidden
            className={`inline-block shrink-0 text-sm opacity-50 transition-transform ${
              open ? 'rotate-90' : ''
            }`}
          >
            ▸
          </span>
          <span className="min-w-0 flex-1 text-base tracking-wide">
            {title}
          </span>
          {meta ? (
            <span className="max-w-[50%] truncate text-sm opacity-50">
              {meta}
            </span>
          ) : null}
        </button>
      </h2>
      {open ? (
        <div id={panelId} className="pb-6">
          {lede ? (
            <p className="max-w-2xl text-base opacity-70">{lede}</p>
          ) : null}
          <div className={lede ? 'mt-4' : undefined}>{children}</div>
        </div>
      ) : null}
    </section>
  );
}
