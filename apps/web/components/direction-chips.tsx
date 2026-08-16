import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CREATOR_DIRECTION_IDS } from '@/lib/creator-directions';

type DirectionChipsProps = {
  active?: string;
};

export async function DirectionChips({ active }: DirectionChipsProps) {
  const t = await getTranslations('Creators');

  return (
    <nav aria-label={t('filter')} className="flex flex-wrap gap-2">
      <Link
        href="/creators"
        className={`rounded border px-3 py-1 text-xs tracking-wide ${
          !active
            ? 'border-[var(--accent)] bg-[var(--accent)]/20'
            : 'border-white/20'
        }`}
      >
        {t('all')}
      </Link>
      {CREATOR_DIRECTION_IDS.map((direction) => (
        <Link
          key={direction}
          href={`/creators?direction=${direction}`}
          className={`rounded border px-3 py-1 text-xs tracking-wide ${
            active === direction
              ? 'border-[var(--accent)] bg-[var(--accent)]/20'
              : 'border-white/20'
          }`}
        >
          {t(`directions.${direction}`)}
        </Link>
      ))}
    </nav>
  );
}
