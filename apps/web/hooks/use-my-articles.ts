'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Article, UpdateArticleFields } from '@nechto/api-contract';
import {
  createMyArticleRequest,
  deleteMyArticleRequest,
  publishMyArticleRequest,
  unpublishMyArticleRequest,
  updateMyArticleRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

export function useMyArticles(initialArticles: Article[]) {
  const tErrors = useTranslations('Errors');
  const [articles, setArticles] = useState(initialArticles);
  const [title, setTitle] = useState('');
  const [lede, setLede] = useState('');
  const [body, setBody] = useState('');
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) {
      return;
    }

    setAdding(true);
    setError(null);
    try {
      const created = await createMyArticleRequest({
        title: title.trim(),
        lede: lede.trim(),
        body: body.trim(),
      });
      setArticles((current) => [created, ...current]);
      setTitle('');
      setLede('');
      setBody('');
      return created;
    } catch (addError) {
      setError(mapApiErrorMessage(addError, tErrors));
      return null;
    } finally {
      setAdding(false);
    }
  }

  async function saveArticle(articleId: string, fields: UpdateArticleFields) {
    setSavingId(articleId);
    setError(null);
    try {
      const updated = await updateMyArticleRequest(articleId, fields);
      setArticles((current) =>
        current.map((article) =>
          article.id === articleId ? updated : article,
        ),
      );
      return updated;
    } catch (saveError) {
      setError(mapApiErrorMessage(saveError, tErrors));
      return null;
    } finally {
      setSavingId(null);
    }
  }

  async function publishArticle(articleId: string) {
    setSavingId(articleId);
    setError(null);
    try {
      const updated = await publishMyArticleRequest(articleId);
      setArticles((current) =>
        current.map((article) =>
          article.id === articleId ? updated : article,
        ),
      );
      return updated;
    } catch (publishError) {
      setError(mapApiErrorMessage(publishError, tErrors));
      return null;
    } finally {
      setSavingId(null);
    }
  }

  async function unpublishArticle(articleId: string) {
    setSavingId(articleId);
    setError(null);
    try {
      const updated = await unpublishMyArticleRequest(articleId);
      setArticles((current) =>
        current.map((article) =>
          article.id === articleId ? updated : article,
        ),
      );
      return updated;
    } catch (unpublishError) {
      setError(mapApiErrorMessage(unpublishError, tErrors));
      return null;
    } finally {
      setSavingId(null);
    }
  }

  async function deleteArticle(articleId: string) {
    setDeletingId(articleId);
    setError(null);
    try {
      await deleteMyArticleRequest(articleId);
      setArticles((current) =>
        current.filter((article) => article.id !== articleId),
      );
      return true;
    } catch (deleteError) {
      setError(mapApiErrorMessage(deleteError, tErrors));
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  return {
    articles,
    title,
    lede,
    body,
    adding,
    savingId,
    deletingId,
    error,
    setTitle,
    setLede,
    setBody,
    addArticle,
    saveArticle,
    publishArticle,
    unpublishArticle,
    deleteArticle,
  };
}
