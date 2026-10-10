'use client';

import { useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';

const SEARCH_FROM = 6;

type StaffDeskListProps<T> = {
  items: T[];
  getSearchText: (item: T) => string;
  empty: string;
  renderItem: (item: T) => ReactNode;
  /** Extra key when item identity is not `id`. */
  keyOf?: (item: T) => string;
  className?: string;
};

export function StaffDeskList<T>({
  items,
  getSearchText,
  empty,
  renderItem,
  keyOf,
  className = '',
}: StaffDeskListProps<T>) {
  const t = useTranslations('Staff');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const searchable = items.length >= SEARCH_FROM;

  const filtered = useMemo(() => {
    if (!deferredQuery) {
      return items;
    }
    return items.filter((item) =>
      getSearchText(item).toLowerCase().includes(deferredQuery),
    );
  }, [deferredQuery, getSearchText, items]);

  if (items.length === 0) {
    return (
      <p className={`text-base opacity-70 ${className}`.trim()}>{empty}</p>
    );
  }

  return (
    <div className={className}>
      {searchable ? (
        <label className="flex flex-col gap-2 text-base">
          <span className="opacity-70">{t('deskSearch')}</span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('deskSearchPlaceholder')}
            autoComplete="off"
          />
        </label>
      ) : null}
      {filtered.length === 0 ? (
        <p className={`${searchable ? 'mt-3' : ''} text-base opacity-70`}>
          {t('deskNoMatches')}
        </p>
      ) : (
        <ul
          className={`${searchable ? 'mt-3' : ''} overlay-y max-h-80 overscroll-contain text-base`}
        >
          {filtered.map((item, index) => (
            <li key={keyOf ? keyOf(item) : String(index)}>
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
      {searchable && !deferredQuery ? (
        <p className="mt-2 text-sm opacity-50">
          {t('deskCount', { count: items.length })}
        </p>
      ) : null}
    </div>
  );
}
