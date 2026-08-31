'use client';

import type { ComponentProps, ReactNode } from 'react';
import { HoverTip } from '@/components/ui/hover-tip';
import { Link } from '@/i18n/navigation';

const chromeIconClass =
  'inline-flex opacity-80 transition-opacity duration-150 hover:opacity-100';

type ChromeIconLinkProps = {
  href: ComponentProps<typeof Link>['href'];
  label: string;
  tip?: string;
  children: ReactNode;
};

export function ChromeIconLink({
  href,
  label,
  tip,
  children,
}: ChromeIconLinkProps) {
  const link = (
    <Link href={href} aria-label={label} className={chromeIconClass}>
      {children}
    </Link>
  );
  return tip ? <HoverTip label={tip}>{link}</HoverTip> : link;
}

type ChromeIconButtonProps = {
  label: string;
  tip: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

export function ChromeIconButton({
  label,
  tip,
  disabled,
  onClick,
  children,
}: ChromeIconButtonProps) {
  return (
    <HoverTip label={tip}>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className={`${chromeIconClass} disabled:opacity-30`}
      >
        {children}
      </button>
    </HoverTip>
  );
}
