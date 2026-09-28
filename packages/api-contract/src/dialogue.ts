import { z } from 'zod';
import type { WorkWithAuthor } from './work';

export const DIALOGUE_TITLE_MAX = 120;
export const DIALOGUE_NOTE_MAX = 400;

const dialogueTitleSchema = z.string().trim().min(1).max(DIALOGUE_TITLE_MAX);
const dialogueNoteSchema = z.string().trim().max(DIALOGUE_NOTE_MAX);

export const createDialogueFieldsSchema = z
  .object({
    title: dialogueTitleSchema,
    note: dialogueNoteSchema.optional().default(''),
    leftWorkId: z.string().cuid(),
    rightWorkId: z.string().cuid(),
  })
  .refine((value) => value.leftWorkId !== value.rightWorkId, {
    message: 'Dialogue works must be different',
    path: ['rightWorkId'],
  });

export type CreateDialogueFields = z.infer<typeof createDialogueFieldsSchema>;

export const updateDialogueFieldsSchema = z
  .object({
    title: dialogueTitleSchema.optional(),
    note: dialogueNoteSchema.optional(),
    leftWorkId: z.string().cuid().optional(),
    rightWorkId: z.string().cuid().optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.note !== undefined ||
      value.leftWorkId !== undefined ||
      value.rightWorkId !== undefined,
    { message: 'At least one field is required' },
  )
  .refine(
    (value) =>
      !value.leftWorkId ||
      !value.rightWorkId ||
      value.leftWorkId !== value.rightWorkId,
    {
      message: 'Dialogue works must be different',
      path: ['rightWorkId'],
    },
  );

export type UpdateDialogueFields = z.infer<typeof updateDialogueFieldsSchema>;

export type DialogueSummary = {
  id: string;
  title: string;
  note: string;
  left: WorkWithAuthor;
  right: WorkWithAuthor;
  publishedAt: string | null;
  featuredAt: string | null;
  hidden: boolean;
  createdAt: string;
};

export type PublicDialogue = DialogueSummary & {
  publishedAt: string;
};

export function canPublishDialogue(input: {
  title: string;
  leftAuthorSlug: string;
  rightAuthorSlug: string;
}): boolean {
  return (
    input.title.trim().length > 0 &&
    input.leftAuthorSlug.length > 0 &&
    input.rightAuthorSlug.length > 0 &&
    input.leftAuthorSlug !== input.rightAuthorSlug
  );
}
