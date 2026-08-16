import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

type ChipLinkProps = {
  href: string;
  children: ReactNode;
  active?: boolean;
};

export function ChipLink({ href, children, active = false }: ChipLinkProps) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 font-sans text-xs tracking-wide ${
        active
          ? 'border-[var(--accent)] bg-[var(--accent)]/20'
          : 'border-white/20 hover:border-[var(--hover-outline)]'
      }`}
    >
      {children}
    </Link>
  );
}
