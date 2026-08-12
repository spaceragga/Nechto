import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).nullable().optional(),
  bio: z.string().trim().max(2000).nullable().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
