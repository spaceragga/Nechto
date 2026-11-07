export const publishedProfileWhere = {
  publishedAt: { not: null },
  slug: { not: null },
  hidden: false,
  user: { suspendedAt: null },
} as const;
