import { getTranslations } from 'next-intl/server';
import { QueryScrollLock } from '@/components/query-scroll-lock';
import { ChipLink } from '@/components/ui/chip-link';
import { CREATOR_DIRECTION_IDS } from '@/lib/creator-directions';

type DirectionChipsProps = {
  active?: string;
  basePath?: '/' | '/creators';
};

function chipHref(basePath: '/' | '/creators', direction?: string): string {
  if (!direction) {
    return basePath;
  }
  return `${basePath === '/' ? '/' : basePath}?direction=${direction}`;
}

export async function DirectionChips({
  active,
  basePath = '/creators',
}: DirectionChipsProps) {
  const t = await getTranslations('Creators');

  return (
    <>
      <QueryScrollLock token={active ?? ''} />
      <nav aria-label={t('filter')} className="flex flex-wrap gap-4">
        <ChipLink href={chipHref(basePath)} active={!active} scroll={false}>
          {t('all')}
        </ChipLink>
        {CREATOR_DIRECTION_IDS.map((direction) => (
          <ChipLink
            key={direction}
            href={chipHref(basePath, direction)}
            active={active === direction}
            scroll={false}
          >
            {t(`directions.${direction}`)}
          </ChipLink>
        ))}
      </nav>
    </>
  );
}
