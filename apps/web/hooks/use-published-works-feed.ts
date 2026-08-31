'use client';

import { useRef, useState } from 'react';
import type { CursorPage, WorkWithAuthor } from '@nechto/api-contract';
import { listPublishedWorksRequest } from '@/lib/api';
import { shuffled } from '@/lib/shuffle';

const PAGE_SIZE = 12;

export function usePublishedWorksFeed(initial: CursorPage<WorkWithAuthor>) {
  const [items, setItems] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  async function loadMore() {
    if (!cursor || loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    try {
      const page = await listPublishedWorksRequest({
        cursor,
        limit: PAGE_SIZE,
      });
      setItems((current) => {
        const seen = new Set(current.map((work) => work.id));
        const incoming = shuffled(
          page.items.filter((work) => !seen.has(work.id)),
        );
        return [...current, ...incoming];
      });
      setCursor(page.nextCursor);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  return { items, hasMore: Boolean(cursor), loading, loadMore };
}
