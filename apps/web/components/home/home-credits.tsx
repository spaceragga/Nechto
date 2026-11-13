import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

export type HomeCredit = {
  label: string;
  href: string;
};

type HomeCreditsProps = {
  credits?: HomeCredit[];
  className?: string;
};

export function HomeCredits({
  credits = [],
  className = '',
}: HomeCreditsProps) {
  if (credits.length === 0) {
    return null;
  }

  return (
    <span
      className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`.trim()}
    >
      {credits.map((credit, index) => (
        <span
          key={`${credit.href}:${credit.label}`}
          className="inline-flex items-baseline gap-x-2"
        >
          {index > 0 ? (
            <span aria-hidden className="opacity-30">
              ·
            </span>
          ) : null}
          <Link href={credit.href} className="home-credit">
            {credit.label}
          </Link>
        </span>
      ))}
    </span>
  );
}

type HomeKickerProps = {
  href?: string;
  children: ReactNode;
  className?: string;
};

export function HomeKicker({
  href,
  children,
  className = '',
}: HomeKickerProps) {
  const look =
    `font-sans text-sm tracking-[0.16em] uppercase ${className}`.trim();

  if (!href) {
    return <p className={`${look} opacity-80`}>{children}</p>;
  }

  return (
    <Link href={href} className={`home-room ${look}`}>
      {children}
    </Link>
  );
}

type HomeCtaProps = {
  href?: string | null;
  children: ReactNode;
  className?: string;
};

export function HomeCta({ href, children, className = 'mt-2' }: HomeCtaProps) {
  if (!href) {
    return null;
  }

  return (
    <Link
      href={href}
      className={`accent-mark font-sans text-base ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
