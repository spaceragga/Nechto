import type {
  CommentTargetType,
  CommentView,
  CursorPage,
} from '@nechto/api-contract';
import { createServerApiClient } from '@/lib/api-server';
import { getCurrentUser } from '@/lib/session';
import { CommentsThread } from './comments-thread';

type CommentsSectionProps = {
  targetType: CommentTargetType;
  targetId: string;
};

export async function CommentsSection({
  targetType,
  targetId,
}: CommentsSectionProps) {
  const [session, page] = await Promise.all([
    getCurrentUser(),
    loadComments(targetType, targetId),
  ]);
  const signedIn = session.status === 'authenticated';

  return (
    <CommentsThread
      targetType={targetType}
      targetId={targetId}
      initial={page}
      signedIn={signedIn}
    />
  );
}

async function loadComments(
  targetType: CommentTargetType,
  targetId: string,
): Promise<CursorPage<CommentView>> {
  try {
    const api = await createServerApiClient();
    return await api.listComments({ targetType, targetId, limit: 50 });
  } catch {
    return { items: [], nextCursor: null };
  }
}
