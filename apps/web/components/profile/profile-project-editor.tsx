'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Project, ProjectBlockInput, Work } from '@nechto/api-contract';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WorkFrame } from '@/components/ui/work-frame';
import { toUploadSrc } from '@/lib/to-upload-src';

type ProfileProjectEditorProps = {
  project: Project;
  works: Work[];
  saving: boolean;
  deleting: boolean;
  error: string | null;
  onSave: (
    title: string,
    description: string,
    blocks: ProjectBlockInput[],
  ) => Promise<unknown>;
  onDelete: () => void;
};

function workById(works: Work[], id: string) {
  return works.find((work) => work.id === id);
}

function toPayload(blocks: ProjectBlockInput[]): ProjectBlockInput[] {
  return blocks
    .filter((block) => block.kind === 'image' || block.body.trim())
    .map((block) =>
      block.kind === 'text' ? { ...block, body: block.body.trim() } : block,
    );
}

export function ProfileProjectEditor({
  project,
  works,
  saving,
  deleting,
  error,
  onSave,
  onDelete,
}: ProfileProjectEditorProps) {
  const t = useTranslations('Projects');
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [blocks, setBlocks] = useState<ProjectBlockInput[]>(() =>
    project.blocks.map((block) =>
      block.kind === 'image'
        ? {
            kind: 'image',
            workId: block.work.id,
            showTitle: block.showTitle !== false,
          }
        : { kind: 'text', body: block.body },
    ),
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const usedIds = new Set(
    blocks
      .filter((block) => block.kind === 'image')
      .map((block) => block.workId),
  );
  const available = works.filter((work) => !usedIds.has(work.id));
  const prefix = `project-${project.id}`;
  const busy = saving || deleting;

  function move(index: number, delta: number) {
    const next = index + delta;
    if (next < 0 || next >= blocks.length) {
      return;
    }
    const copy = [...blocks];
    const [item] = copy.splice(index, 1);
    if (!item) {
      return;
    }
    copy.splice(next, 0, item);
    setBlocks(copy);
    setSaved(false);
  }

  function patchImage(index: number, showTitle: boolean) {
    const current = blocks[index];
    if (!current || current.kind !== 'image') {
      return;
    }
    const copy = [...blocks];
    copy[index] = { ...current, showTitle };
    setBlocks(copy);
    setSaved(false);
  }

  async function saveSeries() {
    if (!title.trim()) {
      return;
    }
    const payload = toPayload(blocks);
    if (!payload.some((block) => block.kind === 'image')) {
      setLocalError(t('needFrame'));
      setSaved(false);
      return;
    }
    setLocalError(null);
    const result = await onSave(title.trim(), description.trim(), payload);
    setSaved(Boolean(result));
  }

  return (
    <article
      aria-label={title.trim() || project.title}
      className="flex min-w-0 flex-col gap-6 border-t border-white/15 pt-6"
    >
      <div className="flex flex-col gap-3">
        <label
          className="flex flex-col gap-2 text-sm"
          htmlFor={`${prefix}-title`}
        >
          <span>{t('name')}</span>
          <Input
            id={`${prefix}-title`}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setSaved(false);
            }}
            maxLength={80}
          />
        </label>
        <label
          className="flex flex-col gap-2 text-sm"
          htmlFor={`${prefix}-lede`}
        >
          <span>{t('description')}</span>
          <Textarea
            id={`${prefix}-lede`}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setSaved(false);
            }}
            maxLength={2000}
            rows={2}
          />
        </label>
      </div>

      <ol className="flex flex-col gap-8">
        {blocks.map((block, index) => {
          const work =
            block.kind === 'image' ? workById(works, block.workId) : undefined;
          return (
            <li key={`${block.kind}-${index}`} className="flex flex-col gap-3">
              {block.kind === 'image' ? (
                <div>
                  <WorkFrame
                    src={toUploadSrc(work?.imageUrl)}
                    alt={work?.title ?? ''}
                    fit="contain"
                    className="h-64 w-full md:h-80"
                  />
                  {work && block.showTitle ? (
                    <p className="mt-2 font-serif text-lg tracking-wide">
                      {work.title}
                    </p>
                  ) : null}
                </div>
              ) : (
                <label className="flex flex-col gap-2 text-sm">
                  <span>{t('text')}</span>
                  <Textarea
                    value={block.body}
                    onChange={(event) => {
                      const copy = [...blocks];
                      copy[index] = { kind: 'text', body: event.target.value };
                      setBlocks(copy);
                      setSaved(false);
                    }}
                    maxLength={2000}
                    rows={4}
                    className="max-w-2xl font-serif"
                  />
                </label>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  {t('moveUp')}
                </Button>
                <Button
                  type="button"
                  disabled={index === blocks.length - 1}
                  onClick={() => move(index, 1)}
                >
                  {t('moveDown')}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setBlocks(blocks.filter((_, current) => current !== index));
                    setSaved(false);
                  }}
                >
                  {t('removeBlock')}
                </Button>
                {block.kind === 'image' ? (
                  <Button
                    type="button"
                    onClick={() => patchImage(index, !block.showTitle)}
                  >
                    {block.showTitle ? t('hideTitle') : t('showTitle')}
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {available.length > 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm">{t('chooseWork')}</p>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {available.map((work) => (
              <li key={work.id}>
                <button
                  type="button"
                  aria-label={work.title}
                  onClick={() => {
                    setBlocks([
                      ...blocks,
                      { kind: 'image', workId: work.id, showTitle: true },
                    ]);
                    setSaved(false);
                  }}
                  className="block w-full text-left outline-offset-4 hover:outline hover:outline-1 hover:outline-[var(--hover-outline)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  <WorkFrame
                    src={toUploadSrc(work.imageUrl)}
                    alt=""
                    fit="cover"
                    className="aspect-3/4 w-full"
                  />
                  <span className="mt-2 block font-serif text-sm tracking-wide">
                    {work.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {localError || error ? (
        <FormError>{localError ?? error ?? ''}</FormError>
      ) : null}
      {saved && !error ? (
        <p className="text-sm opacity-70">{t('saved')}</p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={() => {
            setBlocks([...blocks, { kind: 'text', body: '' }]);
            setSaved(false);
          }}
        >
          {t('addText')}
        </Button>
        <Button
          type="button"
          className="border-transparent bg-[var(--accent)]"
          disabled={busy || !title.trim()}
          onClick={saveSeries}
        >
          {saving ? t('saving') : t('saveBlocks')}
        </Button>
        <Button type="button" disabled={busy} onClick={onDelete}>
          {t('delete')}
        </Button>
      </div>
    </article>
  );
}
