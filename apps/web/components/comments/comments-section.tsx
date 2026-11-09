'use client';

import type { CommentTargetType } from '@nechto/api-contract';
import { CommentsThread } from './comments-thread';

type CommentsSectionProps = {
  targetType: CommentTargetType;
  targetId: string;
  signedIn: boolean;
};

export function CommentsSection({
  targetType,
  targetId,
  signedIn,
}: CommentsSectionProps) {
  return (
    <CommentsThread
      targetType={targetType}
      targetId={targetId}
      signedIn={signedIn}
    />
  );
}
