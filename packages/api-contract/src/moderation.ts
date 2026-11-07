export const MODERATION_ACTIONS = [
  'hide_work',
  'unhide_work',
  'hide_article',
  'unhide_article',
  'hide_dialogue',
  'unhide_dialogue',
  'hide_studio',
  'unhide_studio',
  'hide_project',
  'unhide_project',
  'hide_profile',
  'unhide_profile',
  'resolve_report',
] as const;

export type ModerationActionKind = (typeof MODERATION_ACTIONS)[number];

export const MODERATION_TARGET_TYPES = [
  'work',
  'article',
  'dialogue',
  'project',
  'profile',
  'studio',
] as const;

export type ModerationTargetType = (typeof MODERATION_TARGET_TYPES)[number];

export type ModerationProfileSummary = {
  profileId: string;
  slug: string;
  displayName: string | null;
  avatarUrl: string | null;
  publishedAt: string;
  hidden: boolean;
};

export type ModerationAuditEntry = {
  id: string;
  /** Known kinds preferred; raw DB string kept if the enum lags. */
  action: ModerationActionKind | string;
  targetType: ModerationTargetType | string;
  targetId: string;
  reportId: string | null;
  createdAt: string;
  actor: {
    id: string;
    email: string;
  };
};

export function isModerationAction(
  value: string,
): value is ModerationActionKind {
  return (MODERATION_ACTIONS as readonly string[]).includes(value);
}
