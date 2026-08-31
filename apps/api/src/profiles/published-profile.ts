export const publishedProfileWhere = {
  publishedAt: { not: null },
  slug: { not: null },
} as const;
