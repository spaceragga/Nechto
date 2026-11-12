'use client';

import { useEffect, useState } from 'react';
import { HouseIntro } from '@/components/house-intro';
import { WorkFrame } from '@/components/ui/work-frame';
import { Link } from '@/i18n/navigation';

export type HangingFrame = {
  id: string;
  href: string;
  title: string;
  author: string;
  src?: string | null;
};

type HangingWallProps = {
  title: string;
  lede: string;
  empty: string;
  more?: string;
  nextHref?: string | null;
  frames: HangingFrame[];
};

const GAP = 12;
/** Taller row, then a lower one, so the wall has a pulse instead of one beat. */
const ROW_HEIGHTS = [248, 188, 216];
/** Don't add a frame that would squash the row below this share of the target. */
const MIN_FILL = 0.82;
/** A non-final row may grow this far past the target to meet the wall edges. */
const MAX_STRETCH = 1.25;

type Placed = {
  index: number;
  width: number;
  height: number;
};

function sumAspects(aspects: number[], start: number, end: number): number {
  let sum = 0;
  for (let index = start; index < end; index += 1) {
    sum += aspects[index] ?? 1;
  }
  return sum;
}

function fillHeight(
  aspects: number[],
  start: number,
  end: number,
  containerWidth: number,
): number {
  const count = end - start;
  const gaps = GAP * Math.max(0, count - 1);
  return (containerWidth - gaps) / sumAspects(aspects, start, end);
}

/**
 * Justified hang: each row shares one height and, when it is full, the
 * width of the wall. A short last row stays at the target height and centers.
 */
function packRows(aspects: number[], containerWidth: number): Placed[][] {
  if (containerWidth <= 0 || aspects.length === 0) {
    return [];
  }

  const rows: Placed[][] = [];
  let index = 0;
  let rowNumber = 0;

  while (index < aspects.length) {
    const narrow = containerWidth < 640;
    const target = narrow
      ? 176
      : (ROW_HEIGHTS[rowNumber % ROW_HEIGHTS.length] ?? 216);
    let end = index + 1;

    while (end < aspects.length) {
      const next = fillHeight(aspects, index, end + 1, containerWidth);
      if (next < target * MIN_FILL) {
        break;
      }
      end += 1;
      if (next <= target) {
        break;
      }
    }

    const fill = fillHeight(aspects, index, end, containerWidth);
    const isLast = end >= aspects.length;
    const stretch = !isLast && fill <= target * MAX_STRETCH;
    const rowHeight = stretch ? fill : Math.min(target, fill);
    const placed: Placed[] = [];

    for (let cursor = index; cursor < end; cursor += 1) {
      const aspect = aspects[cursor] ?? 1;
      let width = rowHeight * aspect;
      let height = rowHeight;
      if (width > containerWidth) {
        width = containerWidth;
        height = containerWidth / aspect;
      }
      placed.push({ index: cursor, width, height });
    }

    rows.push(placed);
    index = end;
    rowNumber += 1;
  }

  return rows;
}

function loadAspect(src?: string | null): Promise<number> {
  if (!src) {
    return Promise.resolve(1);
  }
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const ratio = image.naturalWidth / image.naturalHeight;
      resolve(Number.isFinite(ratio) && ratio > 0 ? ratio : 1);
    };
    image.onerror = () => resolve(1);
    image.src = src;
  });
}

export function HangingWall({
  title,
  lede,
  empty,
  more,
  nextHref,
  frames,
}: HangingWallProps) {
  const [aspects, setAspects] = useState<number[] | null>(null);
  const [width, setWidth] = useState(0);
  const [wall, setWall] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all(frames.map((frame) => loadAspect(frame.src))).then(
      (next) => {
        if (!cancelled) {
          setAspects(next);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [frames]);

  useEffect(() => {
    if (!wall) {
      return;
    }
    const measure = () => setWidth(wall.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wall);
    return () => observer.disconnect();
  }, [wall]);

  const rows = aspects && width > 0 ? packRows(aspects, width) : [];

  return (
    <main className="px-6 py-12">
      <HouseIntro title={title} lede={lede} navKey="hanging" />
      <div className="mx-auto mt-10 flex w-full max-w-6xl min-w-0 flex-col text-center">
        {frames.length === 0 ? (
          <p className="text-sm opacity-70">{empty}</p>
        ) : (
          <section
            ref={setWall}
            aria-label={title}
            className="flex min-h-40 w-full flex-col gap-8"
          >
            {rows.map((row) => (
              <div
                key={row.map((item) => item.index).join('-')}
                className="flex items-start justify-center"
                style={{ gap: GAP }}
              >
                {row.map((item) => {
                  const frame = frames[item.index];
                  if (!frame) {
                    return null;
                  }
                  return (
                    <Link
                      key={frame.id}
                      href={frame.href}
                      title={frame.title}
                      className="flex min-w-0 flex-col"
                      style={{ width: item.width }}
                    >
                      <div className="w-full" style={{ height: item.height }}>
                        <WorkFrame
                          src={frame.src}
                          alt={frame.title}
                          fit="contain"
                          className="h-full w-full"
                        />
                      </div>
                      <p className="mt-1.5 truncate text-center font-serif text-sm leading-tight">
                        {frame.title}
                      </p>
                      <p className="mt-0.5 truncate text-center font-serif text-sm opacity-70">
                        {frame.author}
                      </p>
                    </Link>
                  );
                })}
              </div>
            ))}
          </section>
        )}
        {nextHref && more ? (
          <Link
            href={nextHref}
            className="mt-8 font-sans text-base text-[var(--accent)]"
          >
            {more}
          </Link>
        ) : null}
      </div>
    </main>
  );
}
