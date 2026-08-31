'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { UpdateWorkFields, Work } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WorkFrame } from '@/components/ui/work-frame';
import { toUploadSrc } from '@/lib/to-upload-src';

type ProfileWorkEditorProps = {
  work: Work;
  saving: boolean;
  deleting: boolean;
  onSave: (fields: UpdateWorkFields) => Promise<unknown>;
  onDelete: () => void;
};

export function ProfileWorkEditor({
  work,
  saving,
  deleting,
  onSave,
  onDelete,
}: ProfileWorkEditorProps) {
  const t = useTranslations('Works');
  const [title, setTitle] = useState(work.title);
  const [description, setDescription] = useState(work.description);

  const prefix = `work-${work.id}`;

  async function save() {
    if (!title.trim() || !description.trim()) {
      return;
    }
    await onSave({
      title: title.trim(),
      description: description.trim(),
    });
  }

  return (
    <article aria-label={work.title} className="flex min-w-0 flex-col gap-2">
      <WorkFrame
        src={toUploadSrc(work.imageUrl)}
        alt={work.title}
        fit="cover"
        className="aspect-3/4 w-full"
      />
      <label
        className="flex flex-col gap-2 text-sm"
        htmlFor={`${prefix}-title`}
      >
        <span>{t('name')}</span>
        <Input
          id={`${prefix}-title`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={80}
        />
      </label>
      <label
        className="flex flex-col gap-2 text-sm"
        htmlFor={`${prefix}-description`}
      >
        <span>{t('description')}</span>
        <Textarea
          id={`${prefix}-description`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
          rows={3}
        />
      </label>
      <div className="flex flex-col gap-2">
        <Button type="button" disabled={saving || deleting} onClick={save}>
          {saving ? t('saving') : t('save')}
        </Button>
        <Button type="button" disabled={deleting || saving} onClick={onDelete}>
          {t('delete')}
        </Button>
      </div>
    </article>
  );
}
