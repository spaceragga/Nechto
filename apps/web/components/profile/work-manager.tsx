'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { Work } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import {
  createWorkRequest,
  deleteWorkRequest,
  publishMyProfileRequest,
  updateWorkRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

type WorkManagerProps = {
  initialWorks: Work[];
  slug: string | null;
};

export function WorkManager({ initialWorks, slug }: WorkManagerProps) {
  const t = useTranslations('Works');
  const tErrors = useTranslations('Errors');
  const [works, setWorks] = useState(initialWorks);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('file');
    if (!(file instanceof File) || file.size === 0) return;
    setPending(true);
    setError(null);
    try {
      const work = await createWorkRequest(
        {
          title: String(data.get('title') ?? ''),
          altText: String(data.get('altText') ?? ''),
          caption: String(data.get('caption') ?? '') || null,
        },
        file,
      );
      setWorks((current) => [...current, work]);
      form.reset();
    } catch (createError) {
      setError(mapApiErrorMessage(createError, tErrors));
    } finally {
      setPending(false);
    }
  }

  async function togglePublished(work: Work) {
    setPending(true);
    setError(null);
    try {
      const updated = await updateWorkRequest(work.id, {
        status: work.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
      });
      setWorks((current) =>
        current.map((item) => (item.id === work.id ? updated : item)),
      );
    } catch (updateError) {
      setError(mapApiErrorMessage(updateError, tErrors));
    } finally {
      setPending(false);
    }
  }

  async function remove(work: Work) {
    setPending(true);
    try {
      await deleteWorkRequest(work.id);
      setWorks((current) => current.filter((item) => item.id !== work.id));
    } catch (deleteError) {
      setError(mapApiErrorMessage(deleteError, tErrors));
    } finally {
      setPending(false);
    }
  }

  async function publishProfile() {
    setPending(true);
    setError(null);
    try {
      await publishMyProfileRequest();
      setPublished(true);
    } catch (publishError) {
      setError(mapApiErrorMessage(publishError, tErrors));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl">{t('title')}</h2>
      <form onSubmit={create} className="flex flex-col gap-3">
        <Input name="title" required maxLength={120} placeholder={t('name')} />
        <Input
          name="altText"
          required
          maxLength={300}
          placeholder={t('altText')}
        />
        <Input name="caption" maxLength={1000} placeholder={t('caption')} />
        <Input
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
        />
        <Button type="submit" disabled={pending}>
          {t('add')}
        </Button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2">
        {works.map((work) => (
          <article key={work.id} className="border p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- Media is pre-optimized by the API. */}
            <img
              src={work.thumbnailUrl}
              alt={work.altText}
              className="w-full"
            />
            <strong>{work.title}</strong>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                disabled={pending}
                onClick={() => void togglePublished(work)}
              >
                {work.status === 'PUBLISHED' ? t('unpublish') : t('publish')}
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={() => void remove(work)}
              >
                {t('delete')}
              </Button>
            </div>
          </article>
        ))}
      </div>
      {error ? <FormError>{error}</FormError> : null}
      <Button type="button" disabled={pending} onClick={publishProfile}>
        {t('publishProfile')}
      </Button>
      {published && slug ? (
        <p className="text-sm">
          {t('published')}{' '}
          <Link href={`/u/${slug}`} className="underline">
            {t('viewPublic')}
          </Link>
        </p>
      ) : (
        <p className="text-sm opacity-70">{t('publishHint')}</p>
      )}
    </section>
  );
}
