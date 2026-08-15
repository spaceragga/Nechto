'use client';

import { recordContactClickRequest } from '@/lib/api';

type ContactLinkProps = {
  slug: string;
  href: string;
  children: React.ReactNode;
};

export function ContactLink({ slug, href, children }: ContactLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline"
      onClick={() => void recordContactClickRequest(slug)}
    >
      {children}
    </a>
  );
}
