'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ARTICLE_BODY_MIN_PUBLISH,
  canPublishArticle,
  type Article,
  type Work,
} from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ProfileArticleEditorProps = {
  article: Article;
  works: Work[];
  profilePublished: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  onSave: (fields: {
    title: string;
    lede: string;
    body: string;
    coverWorkId: string | null;
  }) => Promise<unknown>;
  onPublish: () => Promise<unknown>;
  onUnpublish: () => Promise<unknown>;
  onDelete: () => void;
};

export function ProfileArticleEditor({
  article,
  works,
  profilePublished,
  saving,
  deleting,
  error,
  onSave,
  onPublish,
  onUnpublish,
  onDelete,
}: ProfileArticleEditorProps) {
  const t = useTranslations('Articles');
  const [title, setTitle] = useState(article.title);
  const [lede, setLede] = useState(article.lede);
  const [body, setBody] = useState(article.body);
  const [coverWorkId, setCoverWorkId] = useState(article.coverWorkId);

  const ready = canPublishArticle({
    title,
    body,
    profilePublished,
  });
  const published = Boolean(article.publishedAt);

  return (
    <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
      <label className="flex flex-col gap-2 text-sm">
        <span>{t('name')}</span>
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span>{t('lede')}</span>
        <Textarea
          value={lede}
          onChange={(event) => setLede(event.target.value)}
          maxLength={280}
          rows={2}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span>{t('body')}</span>
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={20_000}
          rows={10}
        />
        <span className="text-xs opacity-60">
          {t('bodyHint', {
            current: body.trim().length,
            min: ARTICLE_BODY_MIN_PUBLISH,
          })}
        </span>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span>{t('cover')}</span>
        <select
          className="rounded border border-white/20 bg-[var(--bg)] px-3 py-2 text-[var(--fg)] [color-scheme:dark]"
          value={coverWorkId ?? ''}
          onChange={(event) =>
            setCoverWorkId(event.target.value ? event.target.value : null)
          }
        >
          <option value="" className="bg-[var(--bg)] text-[var(--fg)]">
            {t('coverNone')}
          </option>
          {works.map((work) => (
            <option
              key={work.id}
              value={work.id}
              className="bg-[var(--bg)] text-[var(--fg)]"
            >
              {work.title}
            </option>
          ))}
        </select>
      </label>
      {error ? <FormError>{error}</FormError> : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={saving || !title.trim() || !body.trim()}
          onClick={() =>
            void onSave({
              title: title.trim(),
              lede: lede.trim(),
              body: body.trim(),
              coverWorkId,
            })
          }
        >
          {saving ? t('saving') : t('save')}
        </Button>
        {published ? (
          <Button
            type="button"
            disabled={saving}
            onClick={() => void onUnpublish()}
          >
            {t('unpublish')}
          </Button>
        ) : (
          <Button
            type="button"
            disabled={saving || !ready}
            onClick={() => void onPublish()}
          >
            {t('publish')}
          </Button>
        )}
        <Button type="button" disabled={deleting} onClick={onDelete}>
          {deleting ? t('deleting') : t('delete')}
        </Button>
      </div>
      <p className="text-xs opacity-60">
        {published
          ? article.featuredAt
            ? t('statusFeatured')
            : t('statusPublished')
          : t('statusDraft')}
      </p>
    </div>
  );
}
