export const publishedProfileWhere = {
  publishedAt: { not: null },
  slug: { not: null },
  user: { suspendedAt: null },
} as const;
