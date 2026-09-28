import type { DialogueSummary, PublicDialogue } from '@nechto/api-contract';
import {
  toWorkWithAuthorView,
  type WorkWithProfileRecord,
} from '../works/work.mapper';
import type { StorageService } from '../storage/storage.service';

export type DialogueWorkSide = WorkWithProfileRecord;

export type DialogueRecord = {
  id: string;
  title: string;
  note: string;
  publishedAt: Date | null;
  featuredAt: Date | null;
  hidden: boolean;
  createdAt: Date;
  leftWork: DialogueWorkSide;
  rightWork: DialogueWorkSide;
};

export function toDialogueSummary(
  dialogue: DialogueRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): DialogueSummary | null {
  const left = toWorkWithAuthorView(dialogue.leftWork, storage);
  const right = toWorkWithAuthorView(dialogue.rightWork, storage);
  if (!left || !right) {
    return null;
  }

  return {
    id: dialogue.id,
    title: dialogue.title,
    note: dialogue.note,
    left,
    right,
    publishedAt: dialogue.publishedAt?.toISOString() ?? null,
    featuredAt: dialogue.featuredAt?.toISOString() ?? null,
    hidden: dialogue.hidden,
    createdAt: dialogue.createdAt.toISOString(),
  };
}

export function toPublicDialogue(
  dialogue: DialogueRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): PublicDialogue | null {
  const summary = toDialogueSummary(dialogue, storage);
  if (!summary?.publishedAt) {
    return null;
  }
  return {
    ...summary,
    publishedAt: summary.publishedAt,
  };
}
