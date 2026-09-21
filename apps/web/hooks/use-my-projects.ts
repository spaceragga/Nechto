'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Project, ProjectBlockInput } from '@nechto/api-contract';
import {
  createMyProjectRequest,
  deleteMyProjectRequest,
  replaceMyProjectBlocksRequest,
  updateMyProjectRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

export function useMyProjects(initialProjects: Project[]) {
  const tErrors = useTranslations('Errors');
  const [projects, setProjects] = useState(initialProjects);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    setAdding(true);
    setError(null);
    try {
      const created = await createMyProjectRequest({
        title: title.trim(),
        description: description.trim(),
        blocks: [],
      });
      setProjects((current) => [created, ...current]);
      setTitle('');
      setDescription('');
      return created;
    } catch (addError) {
      setError(mapApiErrorMessage(addError, tErrors));
      return null;
    } finally {
      setAdding(false);
    }
  }

  async function saveProject(
    projectId: string,
    fields: {
      title: string;
      description: string;
      blocks: ProjectBlockInput[];
    },
  ) {
    setSavingId(projectId);
    setError(null);
    try {
      await updateMyProjectRequest(projectId, {
        title: fields.title,
        description: fields.description,
      });
      const updated = await replaceMyProjectBlocksRequest(projectId, {
        blocks: fields.blocks,
      });
      setProjects((current) =>
        current.map((project) =>
          project.id === projectId ? updated : project,
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

  async function deleteProject(projectId: string) {
    setDeletingId(projectId);
    setError(null);
    try {
      await deleteMyProjectRequest(projectId);
      setProjects((current) =>
        current.filter((project) => project.id !== projectId),
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
    projects,
    title,
    setTitle,
    description,
    setDescription,
    adding,
    savingId,
    deletingId,
    error,
    addProject,
    saveProject,
    deleteProject,
  };
}
