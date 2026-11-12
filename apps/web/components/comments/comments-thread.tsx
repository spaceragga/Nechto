'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { CommentTargetType, CommentView } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { useHydrated } from '@/hooks/use-hydrated';
import { Link } from '@/i18n/navigation';
import {
  createCommentRequest,
  deleteCommentRequest,
  listCommentsRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';
import { toUploadSrc } from '@/lib/to-upload-src';
import { profilePath } from '@/lib/work-path';

type CommentsThreadProps = {
  targetType: CommentTargetType;
  targetId: string;
  signedIn: boolean;
  lead?: ReactNode;
};

export function CommentsThread({
  targetType,
  targetId,
  signedIn,
  lead,
}: CommentsThreadProps) {
  const t = useTranslations('Comments');
  const tErrors = useTranslations('Errors');
  const locale = useLocale();
  const hydrated = useHydrated();
  const [items, setItems] = useState<CommentView[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [body, setBody] = useState('');
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listCommentsRequest({ targetType, targetId, limit: 50 })
      .then((page) => {
        if (cancelled) {
          return;
        }
        setItems(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(mapApiErrorMessage(caught, tErrors));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId, tErrors]);

  async function submit() {
    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const created = await createCommentRequest({
        targetType,
        targetId,
        body: trimmed,
      });
      setItems((current) => [...current, created]);
      setBody('');
      setOpen(false);
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      await deleteCommentRequest(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setDeletingId(null);
    }
  }

  async function loadMore() {
    if (!nextCursor) {
      return;
    }
    setLoadingMore(true);
    setError(null);
    try {
      const page = await listCommentsRequest({
        targetType,
        targetId,
        cursor: nextCursor,
        limit: 50,
      });
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (caught) {
      setError(mapApiErrorMessage(caught, tErrors));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className="mx-auto mt-12 w-full max-w-2xl border-t border-white/15 pt-8 text-left">
      {lead ? <div className="mb-8 flex justify-center">{lead}</div> : null}
      <h2 className="font-sans text-sm tracking-[0.16em] uppercase opacity-70">
        {t('title')}
      </h2>
      {!loaded ? null : items.length === 0 ? (
        <p className="mt-4 font-serif text-base opacity-70">{t('empty')}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-6">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <CommentAvatar
                name={item.author.displayName ?? t('anonymous')}
                src={toUploadSrc(item.author.avatarUrl)}
              />
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm">
                  {item.author.slug ? (
                    <Link
                      href={profilePath(item.author.slug)}
                      className="text-[var(--accent)]"
                    >
                      {item.author.displayName ?? t('anonymous')}
                    </Link>
                  ) : (
                    <span>{item.author.displayName ?? t('anonymous')}</span>
                  )}
                  <span className="ml-2 opacity-50">
                    {formatCommentDate(item.createdAt, locale)}
                  </span>
                </p>
                <p className="mt-1 font-serif text-base leading-relaxed whitespace-pre-wrap">
                  {item.body}
                </p>
                {item.canDelete ? (
                  <button
                    type="button"
                    className="mt-2 font-sans text-sm text-[var(--accent)] underline-offset-4 hover:underline disabled:opacity-50"
                    disabled={deletingId === item.id || !hydrated}
                    onClick={() => {
                      void remove(item.id);
                    }}
                  >
                    {deletingId === item.id ? t('deleting') : t('delete')}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      {nextCursor ? (
        <button
          type="button"
          className="mt-4 font-sans text-sm text-[var(--accent)] underline-offset-4 hover:underline disabled:opacity-50"
          disabled={loadingMore || !hydrated}
          onClick={() => {
            void loadMore();
          }}
        >
          {t('loadMore')}
        </button>
      ) : null}
      {error ? (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      {signedIn ? (
        <div className="mt-8 flex w-full flex-col items-center gap-3">
          <button
            type="button"
            className="cursor-pointer font-sans text-sm text-[var(--accent)]"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            {t('compose')}
          </button>
          {open ? (
            <form
              className="flex w-full flex-col items-start gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <textarea
                className="min-h-28 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm"
                value={body}
                maxLength={2000}
                aria-label={t('placeholder')}
                autoFocus
                onChange={(event) => setBody(event.target.value)}
              />
              <Button
                type="submit"
                disabled={pending || !hydrated || body.trim().length === 0}
              >
                {pending ? t('submitting') : t('submit')}
              </Button>
            </form>
          ) : null}
        </div>
      ) : (
        <p className="mt-8 text-center font-sans text-sm">
          <Link
            href="/login"
            className="cursor-pointer text-[var(--accent)] no-underline"
          >
            {t('signIn')}
          </Link>
        </p>
      )}
    </section>
  );
}

function CommentAvatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="mt-0.5 h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 font-sans text-xs uppercase opacity-70"
    >
      {name.slice(0, 1)}
    </span>
  );
}

function formatCommentDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString(locale === 'en' ? 'en-GB' : 'ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
