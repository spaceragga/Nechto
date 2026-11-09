import type { CommentView, CommentTargetType } from '@nechto/api-contract';
import type { StorageService } from '../storage/storage.service';

export const commentAuthorSelect = {
  id: true,
  profile: {
    select: {
      slug: true,
      displayName: true,
      avatarKey: true,
    },
  },
} as const;

export type CommentRecord = {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  workId: string | null;
  projectId: string | null;
  articleId: string | null;
  dialogueId: string | null;
  author: {
    id: string;
    profile: {
      slug: string | null;
      displayName: string | null;
      avatarKey: string | null;
    } | null;
  };
};

export function targetTypeOf(row: CommentRecord): CommentTargetType {
  if (row.workId) {
    return 'work';
  }
  if (row.projectId) {
    return 'project';
  }
  if (row.articleId) {
    return 'article';
  }
  return 'dialogue';
}

export function targetIdOf(row: CommentRecord): string {
  return (
    row.workId ?? row.projectId ?? row.articleId ?? row.dialogueId ?? row.id
  );
}

export function toCommentView(
  row: CommentRecord,
  storage: StorageService,
  canDelete: boolean,
): CommentView {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    targetType: targetTypeOf(row),
    targetId: targetIdOf(row),
    canDelete,
    author: {
      userId: row.author.id,
      slug: row.author.profile?.slug ?? null,
      displayName: row.author.profile?.displayName ?? null,
      avatarUrl: row.author.profile?.avatarKey
        ? storage.getPublicUrl(row.author.profile.avatarKey)
        : null,
    },
  };
}
