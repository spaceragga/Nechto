import { z } from 'zod';
import type { Work, WorkAuthor } from './work';

const PROJECT_TITLE_MAX = 80;
const PROJECT_DESCRIPTION_MAX = 2000;
const PROJECT_TEXT_MAX = 2000;
const PROJECT_BLOCKS_MAX = 50;

export const PROJECT_BLOCK_KINDS = ['image', 'text'] as const;
export type ProjectBlockKind = (typeof PROJECT_BLOCK_KINDS)[number];

const projectTitleSchema = z.string().trim().min(1).max(PROJECT_TITLE_MAX);
const projectDescriptionSchema = z.string().trim().max(PROJECT_DESCRIPTION_MAX);
const projectTextSchema = z.string().trim().min(1).max(PROJECT_TEXT_MAX);

export const projectImageBlockInputSchema = z.object({
  kind: z.literal('image'),
  workId: z.string().cuid(),
  showTitle: z.boolean().optional().default(true),
});

export const projectTextBlockInputSchema = z.object({
  kind: z.literal('text'),
  body: projectTextSchema,
});

export const projectBlockInputSchema = z.discriminatedUnion('kind', [
  projectImageBlockInputSchema,
  projectTextBlockInputSchema,
]);

export type ProjectBlockInput = z.infer<typeof projectBlockInputSchema>;

export const createProjectFieldsSchema = z.object({
  title: projectTitleSchema,
  description: projectDescriptionSchema.optional().default(''),
  blocks: z
    .array(projectBlockInputSchema)
    .max(PROJECT_BLOCKS_MAX)
    .optional()
    .default([]),
});

export type CreateProjectFields = z.infer<typeof createProjectFieldsSchema>;

export const updateProjectFieldsSchema = z
  .object({
    title: projectTitleSchema.optional(),
    description: projectDescriptionSchema.optional(),
  })
  .refine(
    (value) => value.title !== undefined || value.description !== undefined,
    { message: 'At least one field is required' },
  );

export type UpdateProjectFields = z.infer<typeof updateProjectFieldsSchema>;

export const replaceProjectBlocksSchema = z.object({
  blocks: z.array(projectBlockInputSchema).max(PROJECT_BLOCKS_MAX),
});

export type ReplaceProjectBlocks = z.infer<typeof replaceProjectBlocksSchema>;

export type ProjectImageBlock = {
  kind: 'image';
  work: Work;
  showTitle: boolean;
};

export type ProjectTextBlock = {
  kind: 'text';
  body: string;
};

export type ProjectBlock = ProjectImageBlock | ProjectTextBlock;

export type Project = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  blocks: ProjectBlock[];
};

export type ProjectSummary = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  coverImageUrl: string | null;
  frameImageUrls: string[];
  blockCount: number;
  author: WorkAuthor;
};

export type PublicProject = Project & {
  author: WorkAuthor;
};
