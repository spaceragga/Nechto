'use client';

import { Suspense, useEffect, useRef, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChipLink } from '@/components/ui/chip-link';
import { usePathname } from '@/i18n/navigation';
import {
  HOUSE_NAV,
  claimedNavButton,
  houseSectionActive,
  subscribeNavButton,
} from '@/lib/house-nav';

type HouseNavBarProps = {
  tab: string | null;
  /** False while the query string is still pending, so neither community tab is claimed. */
  tabKnown: boolean;
};

function HouseNavBar({ tab, tabKnown }: HouseNavBarProps) {
  const t = useTranslations('Site.nav');
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const claimed = useSyncExternalStore(
    subscribeNavButton,
    claimedNavButton,
    () => null,
  );

  useEffect(() => {
    const nav = navRef.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !current) {
      return;
    }
    const navBox = nav.getBoundingClientRect();
    const itemBox = current.getBoundingClientRect();
    if (itemBox.left < navBox.left || itemBox.right > navBox.right) {
      nav.scrollLeft +=
        itemBox.left - navBox.left - (navBox.width - itemBox.width) / 2;
    }
  }, [pathname, tab]);

  return (
    <nav
      ref={navRef}
      aria-label={t('label')}
      className="flex gap-4 overflow-x-auto overscroll-x-contain px-6 pt-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {HOUSE_NAV.map((item) => {
        const current =
          tabKnown || !item.href.startsWith('/community')
            ? houseSectionActive(pathname, tab, item.href)
            : false;
        return (
          <span
            key={item.key}
            className={claimed === item.key ? 'invisible' : undefined}
          >
            <ChipLink href={item.href} active={current} marker={item.key}>
              {t(item.key)}
            </ChipLink>
          </span>
        );
      })}
    </nav>
  );
}

function HouseNavLive() {
  const tab = useSearchParams().get('tab');
  return <HouseNavBar tab={tab} tabKnown />;
}

export function HouseNav() {
  return (
    <Suspense fallback={<HouseNavBar tab={null} tabKnown={false} />}>
      <HouseNavLive />
    </Suspense>
  );
}
