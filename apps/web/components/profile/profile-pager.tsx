'use client';

import { Children, type ReactNode } from 'react';
import { PagerChevron } from '@/components/profile/pager-chevron';

type ProfilePagerProps = {
  index: number;
  prevLabel: string;
  nextLabel: string;
  onIndexChange: (index: number) => void;
  children: ReactNode;
};

function PagerButton({
  label,
  disabled,
  onClick,
  direction,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  direction: 'prev' | 'next';
}) {
  return (
    <div className="sticky top-0 z-10 -mt-16 flex h-dvh shrink-0 items-center self-start">
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className="flex h-36 w-10 items-center justify-center border border-transparent text-current hover:enabled:border-white/30 disabled:opacity-30"
      >
        <PagerChevron direction={direction} />
      </button>
    </div>
  );
}

export function ProfilePager({
  index,
  prevLabel,
  nextLabel,
  onIndexChange,
  children,
}: ProfilePagerProps) {
  const panes = Children.toArray(children);
  const last = panes.length - 1;

  return (
    <div className="flex w-full items-start gap-2 sm:gap-3">
      <PagerButton
        label={prevLabel}
        disabled={index <= 0}
        onClick={() => onIndexChange(index - 1)}
        direction="prev"
      />
      <div className="min-w-0 flex-1">{panes[index]}</div>
      <PagerButton
        label={nextLabel}
        disabled={index >= last}
        onClick={() => onIndexChange(index + 1)}
        direction="next"
      />
    </div>
  );
}
