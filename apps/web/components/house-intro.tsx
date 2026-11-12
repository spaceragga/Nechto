import type { ReactNode } from 'react';
import { HouseTitle } from '@/components/house-title';
import type { HouseNavKey } from '@/lib/house-nav';

/** Shared left inset for the title block and the rows that belong to it. */
const houseIntroInset = 'pl-12 sm:pl-24';

/** Two lines of `leading-relaxed`, so the filter row stays put. */
const ledeSlot = 'min-h-[3.25em]';

type HouseIntroProps = {
  title: string;
  lede: string;
  navKey?: HouseNavKey;
  /** Filter row under the lede. Sits on one line on every page. */
  controls?: ReactNode;
};

export function HouseIntro({ title, lede, navKey, controls }: HouseIntroProps) {
  return (
    <div>
      <header className={`max-w-xl text-left ${houseIntroInset}`}>
        {navKey ? (
          <HouseTitle key={navKey} title={title} navKey={navKey} />
        ) : (
          <h1 className="font-serif text-4xl tracking-wide">{title}</h1>
        )}
        <p
          className={`mt-4 font-sans text-base leading-relaxed opacity-80${
            controls ? ` ${ledeSlot}` : ''
          }`}
        >
          {lede}
        </p>
      </header>
      {controls ? (
        <div className={`mt-6 ${houseIntroInset}`}>{controls}</div>
      ) : null}
    </div>
  );
}
