export const NOTIFICATION_KINDS = [
  'work_liked',
  'profile_followed',
  'work_commented',
  'project_liked',
  'project_commented',
  'article_liked',
  'article_commented',
  'dialogue_liked',
  'dialogue_commented',
] as const;

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export type NotificationItem = {
  id: string;
  kind: NotificationKind | string;
  createdAt: string;
  readAt: string | null;
  actor: {
    userId: string;
    slug: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  work: {
    id: string;
    title: string;
    authorSlug: string | null;
  } | null;
  project: {
    id: string;
    title: string;
    authorSlug: string | null;
  } | null;
  article: {
    id: string;
    title: string;
    authorSlug: string | null;
  } | null;
  dialogue: {
    id: string;
    title: string;
  } | null;
  profile: {
    id: string;
    slug: string | null;
    displayName: string | null;
  } | null;
};

export type NotificationList = {
  items: NotificationItem[];
  unreadCount: number;
};

export type UnreadCount = {
  count: number;
};
