'use client';

import { useState } from 'react';
import type { NotificationList } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import {
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from '@/lib/api';
import { Link } from '@/i18n/navigation';
import {
  articlePath,
  dialoguePath,
  profilePath,
  projectPath,
  workPath,
} from '@/lib/work-path';

type NotificationsPageClientProps = {
  initial: NotificationList;
  labels: {
    empty: string;
    markAll: string;
    kinds: Record<string, string>;
  };
};

export function NotificationsPageClient({
  initial,
  labels,
}: NotificationsPageClientProps) {
  const [items, setItems] = useState(initial.items);
  const [pending, setPending] = useState(false);

  async function markAll() {
    setPending(true);
    try {
      await markAllNotificationsReadRequest();
      setItems((current) =>
        current.map((item) => ({
          ...item,
          readAt: item.readAt ?? new Date().toISOString(),
        })),
      );
    } finally {
      setPending(false);
    }
  }

  async function markOne(id: string) {
    await markNotificationReadRequest(id);
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, readAt: item.readAt ?? new Date().toISOString() }
          : item,
      ),
    );
  }

  if (items.length === 0) {
    return <p className="text-sm opacity-70">{labels.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Button type="button" disabled={pending} onClick={() => void markAll()}>
        {labels.markAll}
      </Button>
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const kindLabel = labels.kinds[item.kind] ?? item.kind;
          const href =
            item.work?.authorSlug && item.work
              ? workPath(item.work.authorSlug, item.work.id)
              : item.project?.authorSlug && item.project
                ? projectPath(item.project.authorSlug, item.project.id)
                : item.article
                  ? articlePath(item.article.id)
                  : item.dialogue
                    ? dialoguePath(item.dialogue.id)
                    : item.profile?.slug
                      ? profilePath(item.profile.slug)
                      : item.actor?.slug
                        ? profilePath(item.actor.slug)
                        : null;
          return (
            <li
              key={item.id}
              className={`border-b border-white/10 py-3 ${item.readAt ? 'opacity-60' : ''}`}
            >
              <p className="font-serif text-base tracking-wide">{kindLabel}</p>
              <p className="mt-1 text-sm opacity-70">
                {item.actor?.displayName ?? item.actor?.slug ?? '—'}
                {item.work ? ` · ${item.work.title}` : null}
                {item.project ? ` · ${item.project.title}` : null}
                {item.article ? ` · ${item.article.title}` : null}
                {item.dialogue ? ` · ${item.dialogue.title}` : null}
                {item.profile?.displayName
                  ? ` · ${item.profile.displayName}`
                  : null}
              </p>
              <p className="mt-1 text-xs opacity-50">
                {new Date(item.createdAt).toLocaleString()}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {href ? (
                  <Link
                    href={href}
                    onClick={() => {
                      if (!item.readAt) {
                        void markOne(item.id);
                      }
                    }}
                  >
                    →
                  </Link>
                ) : null}
                {!item.readAt ? (
                  <button
                    type="button"
                    className="underline opacity-70"
                    onClick={() => void markOne(item.id)}
                  >
                    ✓
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
