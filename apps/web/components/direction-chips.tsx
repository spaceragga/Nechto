import { getTranslations } from 'next-intl/server';
import { ChipLink } from '@/components/ui/chip-link';
import { CREATOR_DIRECTION_IDS } from '@/lib/creator-directions';

type DirectionChipsProps = {
  active?: string;
};

export async function DirectionChips({ active }: DirectionChipsProps) {
  const t = await getTranslations('Creators');

  return (
    <nav aria-label={t('filter')} className="flex flex-wrap gap-2">
      <ChipLink href="/creators" active={!active}>
        {t('all')}
      </ChipLink>
      {CREATOR_DIRECTION_IDS.map((direction) => (
        <ChipLink
          key={direction}
          href={`/creators?direction=${direction}`}
          active={active === direction}
        >
          {t(`directions.${direction}`)}
        </ChipLink>
      ))}
    </nav>
  );
}
