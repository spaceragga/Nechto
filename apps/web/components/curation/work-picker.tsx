'use client';

import { useEffect, useId, useState } from 'react';
import type { WorkWithAuthor } from '@nechto/api-contract';
import { Input } from '@/components/ui/input';
import { listCurationWorksRequest } from '@/lib/api';

type WorkPickerProps = {
  label: string;
  value: string;
  onChange: (workId: string) => void;
  excludeId?: string;
  placeholder: string;
  searchPlaceholder: string;
  empty: string;
  clearLabel: string;
};

function workLabel(work: WorkWithAuthor): string {
  return `${work.title} — ${work.author.displayName}`;
}

export function WorkPicker({
  label,
  value,
  onChange,
  excludeId,
  placeholder,
  searchPlaceholder,
  empty,
  clearLabel,
}: WorkPickerProps) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<WorkWithAuthor[]>([]);
  const [held, setHeld] = useState<WorkWithAuthor | null>(null);

  useEffect(() => {
    if (value && value === excludeId) {
      onChange('');
      setHeld(null);
    }
  }, [value, excludeId, onChange]);

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(() => {
      setLoading(true);
      void listCurationWorksRequest({ q: query.trim(), limit: 30 })
        .then((page) => {
          if (!cancelled) {
            setOptions(page.items);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setOptions([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query]);

  const visible = options.filter((work) => work.id !== excludeId);
  const selected =
    options.find((work) => work.id === value) ??
    (held?.id === value ? held : null);

  function pick(work: WorkWithAuthor) {
    setHeld(work);
    onChange(work.id);
    setQuery('');
    setOpen(false);
  }

  function clear() {
    setHeld(null);
    onChange('');
    setQuery('');
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span>{label}</span>
      {selected ? (
        <div className="flex items-center gap-2 rounded border border-white/20 px-3 py-2">
          <span className="min-w-0 flex-1 truncate">{workLabel(selected)}</span>
          <button
            type="button"
            className="shrink-0 text-[var(--accent)]"
            onClick={clear}
          >
            {clearLabel}
          </button>
        </div>
      ) : (
        <div className="relative">
          <Input
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            placeholder={open || query ? searchPlaceholder : placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 150);
            }}
          />
          {open ? (
            <ul
              id={listId}
              role="listbox"
              className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-white/20 bg-[var(--bg)] py-1 shadow-lg"
            >
              {loading ? (
                <li className="px-3 py-2 text-xs opacity-60">…</li>
              ) : visible.length === 0 ? (
                <li className="px-3 py-2 text-xs opacity-60">{empty}</li>
              ) : (
                visible.map((work) => (
                  <li key={work.id} role="option">
                    <button
                      type="button"
                      className="block w-full truncate px-3 py-2 text-left hover:bg-white/10"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => pick(work)}
                    >
                      {workLabel(work)}
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
