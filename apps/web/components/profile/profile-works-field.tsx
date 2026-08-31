'use client';

import type { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { Work } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { WorkFrame } from '@/components/ui/work-frame';
import { toUploadSrc } from '@/lib/to-upload-src';

type ProfileWorksFieldProps = {
  works: Work[];
  title: string;
  fileInputKey: number;
  adding: boolean;
  deletingId: string | null;
  error: string | null;
  onTitleChange: (value: string) => void;
  onFileChange: (files: FileList | null) => void;
  onAdd: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (workId: string) => void;
};

export function ProfileWorksField({
  works,
  title,
  fileInputKey,
  adding,
  deletingId,
  error,
  onTitleChange,
  onFileChange,
  onAdd,
  onDelete,
}: ProfileWorksFieldProps) {
  const t = useTranslations('Works');

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl tracking-wide">{t('title')}</h2>

      <form onSubmit={onAdd} className="flex flex-col gap-3">
        <label className="flex flex-col gap-2 text-sm" htmlFor="work-title">
          <span>{t('name')}</span>
          <Input
            id="work-title"
            name="workTitle"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            maxLength={80}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm" htmlFor="work-file">
          <span>{t('file')}</span>
          <input
            id="work-file"
            key={fileInputKey}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={adding}
            onChange={(event) => onFileChange(event.target.files)}
          />
        </label>
        {error ? <FormError>{error}</FormError> : null}
        <Button type="submit" disabled={adding || !title.trim()}>
          {adding ? t('adding') : t('add')}
        </Button>
      </form>

      {works.length === 0 ? (
        <p className="text-sm opacity-70">{t('empty')}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {works.map((work) => (
            <li key={work.id} className="flex min-w-0 flex-col gap-2">
              <WorkFrame
                src={toUploadSrc(work.imageUrl)}
                alt={work.title}
                fit="cover"
                className="aspect-[3/4] w-full"
              />
              <p className="truncate font-serif text-sm">{work.title}</p>
              <Button
                type="button"
                disabled={deletingId === work.id}
                onClick={() => onDelete(work.id)}
              >
                {t('delete')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
