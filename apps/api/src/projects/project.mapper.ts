import type {
  Project,
  ProjectBlock,
  ProjectSummary,
  PublicProject,
  WorkAuthor,
} from '@nechto/api-contract';
import {
  CREATOR_DIRECTIONS,
  type CreatorDirection,
} from '@nechto/api-contract';
import type { StorageService } from '../storage/storage.service';
import { toWorkView, type WorkRecord } from '../works/work.mapper';

const directionSet = new Set<string>(CREATOR_DIRECTIONS);

function toDirections(values: string[]): CreatorDirection[] {
  return values.filter((value): value is CreatorDirection =>
    directionSet.has(value),
  );
}

export type ProjectBlockRecord = {
  kind: string;
  body: string;
  showTitle: boolean;
  work: WorkRecord | null;
};

export type ProjectRecord = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  blocks: ProjectBlockRecord[];
};

export type ProjectWithProfileRecord = ProjectRecord & {
  profile: {
    slug: string | null;
    displayName: string | null;
    avatarKey: string | null;
    directions: string[];
  };
};

function toAuthor(
  profile: ProjectWithProfileRecord['profile'],
  storage: Pick<StorageService, 'getPublicUrl'>,
): WorkAuthor | null {
  if (!profile.slug) {
    return null;
  }

  return {
    slug: profile.slug,
    displayName: profile.displayName ?? profile.slug,
    avatarUrl: profile.avatarKey
      ? storage.getPublicUrl(profile.avatarKey)
      : null,
    directions: toDirections(profile.directions ?? []),
  };
}

export function toProjectBlocks(
  blocks: ProjectBlockRecord[],
  storage: Pick<StorageService, 'getPublicUrl'>,
): ProjectBlock[] {
  const mapped: ProjectBlock[] = [];
  for (const block of blocks) {
    if (block.kind === 'image' && block.work) {
      mapped.push({
        kind: 'image',
        work: toWorkView(block.work, storage),
        showTitle: block.showTitle,
      });
      continue;
    }
    if (block.kind === 'text' && block.body.trim()) {
      mapped.push({ kind: 'text', body: block.body });
    }
  }
  return mapped;
}

export function toProjectView(
  project: ProjectRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): Project {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    blocks: toProjectBlocks(project.blocks, storage),
  };
}

export function toProjectSummary(
  project: ProjectWithProfileRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): ProjectSummary | null {
  const author = toAuthor(project.profile, storage);
  if (!author) {
    return null;
  }

  const blocks = toProjectBlocks(project.blocks, storage);
  const frames = blocks
    .filter((block) => block.kind === 'image')
    .slice(0, 4)
    .map((block) => block.work.imageUrl);
  const cover = frames[0] ?? null;

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    coverImageUrl: cover,
    frameImageUrls: frames,
    blockCount: blocks.length,
    author,
  };
}

export function toPublicProjectView(
  project: ProjectWithProfileRecord,
  storage: Pick<StorageService, 'getPublicUrl'>,
): PublicProject | null {
  const author = toAuthor(project.profile, storage);
  if (!author) {
    return null;
  }

  return {
    ...toProjectView(project, storage),
    author,
  };
}
