import { z } from 'zod';

export const workFieldsSchema = z.object({
  title: z.string().trim().min(1).max(120),
  caption: z.string().trim().max(1000).nullable().optional(),
  altText: z.string().trim().min(1).max(300),
});

export const updateWorkSchema = workFieldsSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export const reorderWorksSchema = z.object({
  workIds: z.array(z.string().cuid()).min(1).max(50),
});

export type WorkFieldsDto = z.infer<typeof workFieldsSchema>;
export type UpdateWorkDto = z.infer<typeof updateWorkSchema>;
export type ReorderWorksDto = z.infer<typeof reorderWorksSchema>;

export type Work = {
  id: string;
  title: string;
  caption: string | null;
  altText: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  position: number;
  status: 'DRAFT' | 'PUBLISHED';
};

export type PublicCreatorProfile = {
  profile: import('./profile').PublicProfile;
  works: Work[];
};
