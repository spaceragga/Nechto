'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { UpdateWorkFields, Work } from '@nechto/api-contract';
import { ChromeIconButton } from '@/components/chrome-icon';
import { EyeGlyph } from '@/components/glyphs/eye-glyph';
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
      <div className="group relative">
        <WorkFrame
          src={toUploadSrc(work.imageUrl)}
          alt={work.title}
          fit="cover"
          className="aspect-3/4 w-full"
        />
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/55 transition-opacity ${
            work.hidden
              ? 'opacity-100'
              : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'
          }`}
        >
          <ChromeIconButton
            label={work.hidden ? t('showOnPage') : t('hideOnPage')}
            tip={work.hidden ? t('showOnPage') : t('hideOnPage')}
            tipAlign="center"
            disabled={saving || deleting}
            onClick={() => {
              void onSave({ hidden: !work.hidden });
            }}
          >
            <EyeGlyph
              open={!work.hidden}
              className="h-20 w-20 text-[var(--fg)]"
            />
          </ChromeIconButton>
        </div>
      </div>
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
