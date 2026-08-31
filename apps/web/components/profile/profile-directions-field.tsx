'use client';

import { useTranslations } from 'next-intl';
import type { CreatorDirection } from '@nechto/api-contract';
import { CREATOR_DIRECTION_IDS } from '@/lib/creator-directions';

type ProfileDirectionsFieldProps = {
  selected: CreatorDirection[];
  onToggle: (direction: CreatorDirection) => void;
};

export function ProfileDirectionsField({
  selected,
  onToggle,
}: ProfileDirectionsFieldProps) {
  const t = useTranslations('Profile');

  return (
    <fieldset className="flex flex-col gap-2 text-sm">
      <legend>{t('directions')}</legend>
      <div className="flex flex-wrap gap-2">
        {CREATOR_DIRECTION_IDS.map((direction) => {
          const active = selected.includes(direction);
          return (
            <button
              key={direction}
              type="button"
              onClick={() => onToggle(direction)}
              aria-pressed={active}
              className={`px-3 py-1 font-sans ${
                active
                  ? 'bg-[var(--accent)] text-[var(--fg)]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08]'
              }`}
            >
              {t(`directionLabels.${direction}`)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
