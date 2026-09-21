'use client';

import type { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { Project, ProjectBlockInput, Work } from '@nechto/api-contract';
import { ProfileProjectEditor } from '@/components/profile/profile-project-editor';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ProfileProjectsFieldProps = {
  projects: Project[];
  works: Work[];
  title: string;
  description: string;
  adding: boolean;
  savingId: string | null;
  deletingId: string | null;
  error: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAdd: (event: FormEvent<HTMLFormElement>) => void;
  onSave: (
    projectId: string,
    title: string,
    description: string,
    blocks: ProjectBlockInput[],
  ) => Promise<unknown>;
  onDelete: (projectId: string) => void;
};

export function ProfileProjectsField({
  projects,
  works,
  title,
  description,
  adding,
  savingId,
  deletingId,
  error,
  onTitleChange,
  onDescriptionChange,
  onAdd,
  onSave,
  onDelete,
}: ProfileProjectsFieldProps) {
  const t = useTranslations('Projects');

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl tracking-wide">{t('title')}</h2>

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
            maxLength={80}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span>{t('description')}</span>
          <Textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            maxLength={2000}
            rows={2}
          />
        </label>
        <Button type="submit" disabled={adding || !title.trim()}>
          {adding ? t('adding') : t('add')}
        </Button>
      </form>

      {error ? <FormError>{error}</FormError> : null}

      {works.length === 0 ? (
        <p className="text-sm opacity-70">{t('needWorks')}</p>
      ) : null}

      {projects.length === 0 ? (
        <p className="text-sm opacity-70">{t('empty')}</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {projects.map((project) => (
            <li key={project.id}>
              <ProfileProjectEditor
                project={project}
                works={works}
                saving={savingId === project.id}
                deleting={deletingId === project.id}
                error={error}
                onSave={(nextTitle, nextDescription, blocks) =>
                  onSave(project.id, nextTitle, nextDescription, blocks)
                }
                onDelete={() => onDelete(project.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
