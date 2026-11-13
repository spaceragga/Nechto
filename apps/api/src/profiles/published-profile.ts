export const publishedProfileWhere = {
  publishedAt: { not: null },
  slug: { not: null },
  hidden: false,
  user: { suspendedAt: null },
} as const;

/**
 * A catalog work is public when it is not hidden.
 * A series frame is stored hidden so it stays off the works grid, but it is
 * still a public work while it sits in a published series.
 */
export function publicWorkWhere(id: string) {
  return {
    id,
    profile: publishedProfileWhere,
    OR: [
      { hidden: false },
      {
        projectBlocks: {
          some: {
            project: {
              hidden: false,
              profile: publishedProfileWhere,
            },
          },
        },
      },
    ],
  };
}
