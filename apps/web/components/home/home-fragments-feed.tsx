'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { CursorPage, WorkWithAuthor } from '@nechto/api-contract';
import { MediaTile } from '@/components/ui/media-tile';
import { usePublishedWorksFeed } from '@/hooks/use-published-works-feed';
import { toUploadSrc } from '@/lib/to-upload-src';
import { workPath } from '@/lib/work-path';

type HomeFragmentsFeedProps = {
  initial: CursorPage<WorkWithAuthor>;
};

export function HomeFragmentsFeed({ initial }: HomeFragmentsFeedProps) {
  const t = useTranslations('HomePage');
  const { items, hasMore, loading, loadMore } = usePublishedWorksFeed(initial);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) {
      return;
    }
    const node = sentinelRef.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: '320px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, items.length, loadMore]);

  return (
    <section id="fragments" className="scroll-mt-20">
      <h2 className="mb-3 font-sans text-xl tracking-wide">{t('fragments')}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
        {items.map((work) => (
          <MediaTile
            key={work.id}
            href={workPath(work.author.slug, work.id)}
            title={work.title}
            src={toUploadSrc(work.imageUrl)}
            wellClassName="h-36 w-full"
          />
        ))}
      </div>
      {hasMore ? (
        <div
          ref={sentinelRef}
          data-fragments-more
          className="h-8"
          aria-busy={loading}
        />
      ) : null}
    </section>
  );
}
