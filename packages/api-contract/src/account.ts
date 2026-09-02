import { z } from 'zod';

export const deleteAccountSchema = z.object({
  password: z.string().min(1).max(128),
});

export type DeleteAccountDto = z.infer<typeof deleteAccountSchema>;

export type AccountActionResponse = {
  ok: true;
};
