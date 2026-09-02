'use client';

import type { MouseEvent, ReactNode } from 'react';
import { useHydrated } from '@/hooks/use-hydrated';
import { Link, useRouter } from '@/i18n/navigation';
import { markPreserveScroll } from '@/lib/preserve-scroll';

type ChipLinkProps = {
  href: string;
  children: ReactNode;
  active?: boolean;
  scroll?: boolean;
};

export function ChipLink({
  href,
  children,
  active = false,
  scroll = true,
}: ChipLinkProps) {
  const router = useRouter();
  const hydrated = useHydrated();

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      scroll ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }
    event.preventDefault();
    markPreserveScroll();
    router.push(href, { scroll: false });
  }

  return (
    <Link
      href={href}
      scroll={scroll}
      onClick={onClick}
      data-hydrated={hydrated ? 'true' : 'false'}
      className={`inline-flex items-center justify-center px-5 py-1 font-sans text-xl tracking-wide transition-colors duration-150 ${
        active
          ? 'bg-[var(--accent)] text-[var(--fg)]'
          : 'bg-white/[0.04] hover:bg-white/[0.08]'
      } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`}
    >
      {children}
    </Link>
  );
}
