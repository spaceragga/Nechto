'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import {
  claimNavButton,
  releaseNavButton,
  type HouseNavKey,
} from '@/lib/house-nav';

/** Landed title chip, 1.125× the nav chip (`px-5 py-1 text-xl`). */
const CHIP_BIG =
  'inline-flex shrink-0 items-center justify-center bg-[var(--accent)] px-[1.40625rem] py-[0.28125rem] font-sans text-[1.40625rem] leading-[1.4] tracking-wide text-[var(--fg)]';
const EASE = 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)';
const ARRIVED_SCALE = 1.125;

type Flight = {
  left: number;
  top: number;
  x: number;
  y: number;
  move: boolean;
};

type HouseTitleProps = {
  title: string;
  navKey: HouseNavKey;
};

export function HouseTitle({ title, navKey }: HouseTitleProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [landed, setLanded] = useState(false);

  useLayoutEffect(() => {
    const heading = headingRef.current;
    const source = document.querySelector<HTMLElement>(
      `header [data-house-nav="${navKey}"]`,
    );
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (!heading || !source || reduce) {
      claimNavButton(navKey);
      setLanded(true);
      return () => releaseNavButton(navKey);
    }

    const from = source.getBoundingClientRect();
    const to = heading.getBoundingClientRect();
    claimNavButton(navKey);
    setFlight({
      left: to.left,
      top: to.top,
      x: from.left + from.width / 2 - (to.left + to.width / 2),
      y: from.top + from.height / 2 - (to.top + to.height / 2),
      move: false,
    });

    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        setFlight((current) =>
          current ? { ...current, move: true } : current,
        );
      });
    });
    const timeout = window.setTimeout(() => setLanded(true), 700);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      releaseNavButton(navKey);
    };
  }, [navKey]);

  return (
    <>
      <h1
        ref={headingRef}
        className={`${CHIP_BIG} ${landed ? '' : 'opacity-0'}`}
      >
        {title}
      </h1>
      {flight && !landed ? (
        <span
          aria-hidden
          className={`pointer-events-none fixed z-30 origin-center ${CHIP_BIG}`}
          style={{
            left: flight.left,
            top: flight.top,
            transform: flight.move
              ? 'translate(0px, 0px) scale(1)'
              : `translate(${flight.x}px, ${flight.y}px) scale(${1 / ARRIVED_SCALE})`,
            transition: flight.move ? EASE : 'none',
          }}
          onTransitionEnd={(event) => {
            if (event.propertyName === 'transform') {
              setLanded(true);
            }
          }}
        >
          {title}
        </span>
      ) : null}
    </>
  );
}
