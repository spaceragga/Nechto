'use client';

import type { ReactNode } from 'react';
import type { CommentTargetType } from '@nechto/api-contract';
import { CommentsThread } from './comments-thread';

type CommentsSectionProps = {
  targetType: CommentTargetType;
  targetId: string;
  signedIn: boolean;
  lead?: ReactNode;
};

export function CommentsSection({
  targetType,
  targetId,
  signedIn,
  lead,
}: CommentsSectionProps) {
  return (
    <CommentsThread
      targetType={targetType}
      targetId={targetId}
      signedIn={signedIn}
      lead={lead}
    />
  );
}
