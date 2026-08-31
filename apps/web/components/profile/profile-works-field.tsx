'use client';

import type { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { UpdateWorkFields, Work } from '@nechto/api-contract';
import { ProfileWorkAddForm } from '@/components/profile/profile-work-add-form';
import { ProfileWorkEditor } from '@/components/profile/profile-work-editor';

type ProfileWorksFieldProps = {
  works: Work[];
  title: string;
  description: string;
  fileInputKey: number;
  adding: boolean;
  hasFile: boolean;
  savingId: string | null;
  deletingId: string | null;
  error: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFileChange: (files: FileList | null) => void;
  onAdd: (event: FormEvent<HTMLFormElement>) => void;
  onSave: (workId: string, fields: UpdateWorkFields) => Promise<unknown>;
  onDelete: (workId: string) => void;
};

export function ProfileWorksField({
  works,
  title,
  description,
  fileInputKey,
  adding,
  hasFile,
  savingId,
  deletingId,
  error,
  onTitleChange,
  onDescriptionChange,
  onFileChange,
  onAdd,
  onSave,
  onDelete,
}: ProfileWorksFieldProps) {
  const t = useTranslations('Works');

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl tracking-wide">{t('title')}</h2>

      <ProfileWorkAddForm
        title={title}
        description={description}
        fileInputKey={fileInputKey}
        adding={adding}
        hasFile={hasFile}
        error={error}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onFileChange={onFileChange}
        onAdd={onAdd}
      />

      {works.length === 0 ? (
        <p className="text-sm opacity-70">{t('empty')}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {works.map((work) => (
            <li key={work.id}>
              <ProfileWorkEditor
                work={work}
                saving={savingId === work.id}
                deleting={deletingId === work.id}
                onSave={(fields) => onSave(work.id, fields)}
                onDelete={() => onDelete(work.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
