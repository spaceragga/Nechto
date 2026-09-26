'use client';

import type { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { Article, Work } from '@nechto/api-contract';
import { ProfileArticleEditor } from '@/components/profile/profile-article-editor';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ProfileArticlesFieldProps = {
  articles: Article[];
  works: Work[];
  profilePublished: boolean;
  title: string;
  lede: string;
  body: string;
  adding: boolean;
  savingId: string | null;
  deletingId: string | null;
  error: string | null;
  onTitleChange: (value: string) => void;
  onLedeChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onAdd: (event: FormEvent<HTMLFormElement>) => void;
  onSave: (
    articleId: string,
    fields: {
      title: string;
      lede: string;
      body: string;
      coverWorkId: string | null;
    },
  ) => Promise<unknown>;
  onPublish: (articleId: string) => Promise<unknown>;
  onUnpublish: (articleId: string) => Promise<unknown>;
  onDelete: (articleId: string) => void;
};

export function ProfileArticlesField({
  articles,
  works,
  profilePublished,
  title,
  lede,
  body,
  adding,
  savingId,
  deletingId,
  error,
  onTitleChange,
  onLedeChange,
  onBodyChange,
  onAdd,
  onSave,
  onPublish,
  onUnpublish,
  onDelete,
}: ProfileArticlesFieldProps) {
  const t = useTranslations('Articles');

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-serif text-2xl tracking-wide">{t('title')}</h2>
        <p className="mt-2 text-sm opacity-70">{t('ledeHint')}</p>
      </div>

      <form
        aria-label={t('add')}
        onSubmit={onAdd}
        className="flex flex-col gap-3"
      >
        <label className="flex flex-col gap-2 text-sm">
          <span>{t('name')}</span>
          <Input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            maxLength={120}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span>{t('lede')}</span>
          <Textarea
            value={lede}
            onChange={(event) => onLedeChange(event.target.value)}
            maxLength={280}
            rows={2}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span>{t('body')}</span>
          <Textarea
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            maxLength={20_000}
            rows={6}
          />
        </label>
        <Button
          type="submit"
          disabled={adding || !title.trim() || !body.trim()}
        >
          {adding ? t('adding') : t('add')}
        </Button>
      </form>

      {error ? <FormError>{error}</FormError> : null}

      {!profilePublished ? (
        <p className="text-sm opacity-70">{t('needPublish')}</p>
      ) : null}

      {articles.length === 0 ? (
        <p className="text-sm opacity-70">{t('empty')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {articles.map((article) => (
            <li key={article.id}>
              <ProfileArticleEditor
                article={article}
                works={works}
                profilePublished={profilePublished}
                saving={savingId === article.id}
                deleting={deletingId === article.id}
                error={error}
                onSave={(fields) => onSave(article.id, fields)}
                onPublish={() => onPublish(article.id)}
                onUnpublish={() => onUnpublish(article.id)}
                onDelete={() => onDelete(article.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
