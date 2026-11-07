'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChromeIconLink } from '@/components/chrome-icon';
import { BellGlyph } from '@/components/glyphs/bell-glyph';
import { unreadNotificationCountRequest } from '@/lib/api';

export function NotificationsBell() {
  const t = useTranslations('Notifications');
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void unreadNotificationCountRequest()
      .then((result) => {
        if (!cancelled) {
          setCount(result.count);
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ChromeIconLink href="/notifications" label={t('title')} tip={t('title')}>
      <span className="relative inline-flex">
        <BellGlyph />
        {count > 0 ? (
          <span className="absolute -right-1 -top-0.5 min-w-4 rounded-full bg-[var(--accent)] px-1 text-center text-[10px] leading-4 text-[var(--bg)]">
            {count > 99 ? '99+' : count}
          </span>
        ) : null}
      </span>
    </ChromeIconLink>
  );
}
