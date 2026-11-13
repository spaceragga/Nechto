'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { ChromeIconButton } from '@/components/chrome-icon';
import { SearchGlyph } from '@/components/glyphs/search-glyph';
import { usePathname, useRouter } from '@/i18n/navigation';

const IDLE_CLOSE_MS = 30_000;

export function HeaderSearch() {
  const t = useTranslations('Search');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQ = pathname === '/search' ? (searchParams.get('q') ?? '') : '';
  const [open, setOpen] = useState(urlQ.length > 0);
  const [q, setQ] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  const inputRef = useRef<HTMLInputElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setQ(urlQ);
    if (urlQ.length > 0) {
      setOpen(true);
    }
  }

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const bumpIdle = useCallback(() => {
    clearIdleTimer();
    if (!open) {
      return;
    }
    idleTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, IDLE_CLOSE_MS);
  }, [clearIdleTimer, open]);

  useEffect(() => {
    if (!open) {
      clearIdleTimer();
      return;
    }
    inputRef.current?.focus();
    bumpIdle();
    return clearIdleTimer;
  }, [open, bumpIdle, clearIdleTimer]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="flex items-center">
      <div
        className={`overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open
            ? 'mr-1 max-w-[min(25.2rem,calc(100vw-11rem))] opacity-100'
            : 'pointer-events-none mr-0 max-w-0 opacity-0'
        }`}
      >
        <form
          role="search"
          className="flex h-10 w-[min(25.2rem,calc(100vw-11rem))] items-center"
          onSubmit={(event) => {
            event.preventDefault();
            const next = q.trim();
            if (next.length < 2) {
              return;
            }
            bumpIdle();
            router.push(`/search?q=${encodeURIComponent(next)}`);
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(event) => {
              setQ(event.target.value);
              bumpIdle();
            }}
            onFocus={bumpIdle}
            onKeyDown={bumpIdle}
            onPointerDown={bumpIdle}
            placeholder={t('placeholder')}
            aria-label={t('title')}
            tabIndex={open ? 0 : -1}
            className="h-8 w-full border-0 border-b border-white/25 bg-transparent px-0.5 font-sans text-sm tracking-wide text-[var(--fg)] outline-none placeholder:text-white/35 focus:border-white/55"
          />
        </form>
      </div>
      <ChromeIconButton
        label={t('title')}
        tip={t('title')}
        tipAlign="end"
        onClick={() => setOpen((value) => !value)}
      >
        <SearchGlyph />
      </ChromeIconButton>
    </div>
  );
}
