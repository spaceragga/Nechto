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
