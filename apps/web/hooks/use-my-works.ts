'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { UpdateWorkFields, Work } from '@nechto/api-contract';
import {
  deleteMyWorkRequest,
  updateMyWorkRequest,
  uploadMyWorkRequest,
} from '@/lib/api';
import { mapApiErrorMessage } from '@/lib/map-api-error';

export function useMyWorks(initialWorks: Work[]) {
  const tErrors = useTranslations('Errors');
  const [works, setWorks] = useState(initialWorks);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function selectFile(fileList: FileList | null) {
    setFile(fileList?.[0] ?? null);
    setError(null);
  }

  async function addWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !title.trim() || !description.trim()) {
      return;
    }

    setAdding(true);
    setError(null);

    try {
      const created = await uploadMyWorkRequest(file, {
        title: title.trim(),
        description: description.trim(),
      });
      setWorks((current) => [created, ...current]);
      setTitle('');
      setDescription('');
      setFile(null);
      setFileInputKey((key) => key + 1);
      return created;
    } catch (addError) {
      setError(mapApiErrorMessage(addError, tErrors));
      return null;
    } finally {
      setAdding(false);
    }
  }

  async function updateWork(workId: string, fields: UpdateWorkFields) {
    setSavingId(workId);
    setError(null);

    try {
      const updated = await updateMyWorkRequest(workId, fields);
      setWorks((current) =>
        current.map((work) => (work.id === workId ? updated : work)),
      );
      return updated;
    } catch (updateError) {
      setError(mapApiErrorMessage(updateError, tErrors));
      return null;
    } finally {
      setSavingId(null);
    }
  }

  async function deleteWork(workId: string) {
    setDeletingId(workId);
    setError(null);

    try {
      await deleteMyWorkRequest(workId);
      setWorks((current) => current.filter((work) => work.id !== workId));
      return true;
    } catch (deleteError) {
      setError(mapApiErrorMessage(deleteError, tErrors));
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  return {
    works,
    title,
    setTitle,
    description,
    setDescription,
    file,
    selectFile,
    fileInputKey,
    adding,
    savingId,
    deletingId,
    error,
    addWork,
    updateWork,
    deleteWork,
  };
}
