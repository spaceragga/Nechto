'use client';

import type { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ProfileWorkAddFormProps = {
  title: string;
  description: string;
  fileInputKey: number;
  adding: boolean;
  hasFile: boolean;
  error: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFileChange: (files: FileList | null) => void;
  onAdd: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProfileWorkAddForm({
  title,
  description,
  fileInputKey,
  adding,
  hasFile,
  error,
  onTitleChange,
  onDescriptionChange,
  onFileChange,
  onAdd,
}: ProfileWorkAddFormProps) {
  const t = useTranslations('Works');
  const canAdd = Boolean(title.trim() && description.trim() && hasFile);

  return (
    <form
      aria-label={t('add')}
      onSubmit={onAdd}
      className="flex flex-col gap-3"
    >
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
      <label className="flex flex-col gap-2 text-sm" htmlFor="work-description">
        <span>{t('description')}</span>
        <Textarea
          id="work-description"
          name="workDescription"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          maxLength={2000}
          rows={4}
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
      <Button type="submit" disabled={adding || !canAdd}>
        {adding ? t('adding') : t('add')}
      </Button>
    </form>
  );
}
