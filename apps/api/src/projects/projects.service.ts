import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  type CreateProjectFields,
  type CursorPage,
  type CursorPageQuery,
  type ListPublishedProjectsQuery,
  type Project,
  type ProjectBlockInput,
  type ProjectSummary,
  type PublicProject,
  type UpdateProjectFields,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';
import { publishedProfileWhere } from '../profiles/published-profile';
import { StorageService } from '../storage/storage.service';
import {
  toProjectSummary,
  toProjectView,
  toPublicProjectView,
  type ProjectRecord,
  type ProjectWithProfileRecord,
} from './project.mapper';

const blockInclude = {
  work: true,
} as const;

const projectInclude = {
  blocks: {
    orderBy: { position: 'asc' as const },
    include: blockInclude,
  },
};

const publishedAuthorSelect = {
  slug: true,
  displayName: true,
  avatarKey: true,
  directions: true,
} as const;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async listMine(
    userId: string,
    query: CursorPageQuery,
  ): Promise<CursorPage<Project>> {
    const profile = await this.requireProfile(userId);
    const rows = await this.prisma.project.findMany({
      where: { profileId: profile.id },
      orderBy: { id: 'desc' },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: projectInclude,
    });

    return this.pageProjects(rows, query.limit);
  }

  async getMine(userId: string, projectId: string): Promise<Project> {
    const project = await this.requireOwnedProject(userId, projectId);
    return toProjectView(project, this.storage);
  }

  async listPublished(
    query: ListPublishedProjectsQuery,
  ): Promise<CursorPage<ProjectSummary>> {
    const rows = await this.prisma.project.findMany({
      where: {
        profile: {
          ...publishedProfileWhere,
          ...(query.direction ? { directions: { has: query.direction } } : {}),
        },
        blocks: { some: { kind: 'image' } },
      },
      orderBy: { id: 'desc' },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: {
        ...projectInclude,
        profile: { select: publishedAuthorSelect },
      },
    });

    return this.pageSummaries(rows, query.limit);
  }

  async listPublishedBySlug(
    slug: string,
    query: CursorPageQuery,
  ): Promise<CursorPage<ProjectSummary>> {
    const profile = await this.prisma.profile.findFirst({
      where: { ...publishedProfileWhere, slug },
      select: { id: true, ...publishedAuthorSelect },
    });

    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }

    const { id: profileId, ...author } = profile;
    const rows = await this.prisma.project.findMany({
      where: {
        profileId,
        blocks: { some: { kind: 'image' } },
      },
      orderBy: { id: 'desc' },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      take: query.limit + 1,
      include: projectInclude,
    });

    return this.pageSummaries(
      rows.map((row) => ({ ...row, profile: author })),
      query.limit,
    );
  }

  async getPublishedById(id: string): Promise<PublicProject> {
    const row = await this.prisma.project.findFirst({
      where: {
        id,
        profile: publishedProfileWhere,
      },
      include: {
        ...projectInclude,
        profile: { select: publishedAuthorSelect },
      },
    });

    const view = row ? toPublicProjectView(row, this.storage) : null;
    if (!view || !view.blocks.some((block) => block.kind === 'image')) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROJECT_NOT_FOUND,
        'Project not found',
      );
    }

    return view;
  }

  async createMine(
    userId: string,
    fields: CreateProjectFields,
  ): Promise<Project> {
    const profile = await this.requireProfile(userId);
    const blockRows = await this.prepareBlocks(profile.id, fields.blocks);

    const created = await this.prisma.project.create({
      data: {
        profileId: profile.id,
        title: fields.title,
        description: fields.description,
        blocks: { create: blockRows },
      },
      include: projectInclude,
    });

    return toProjectView(created, this.storage);
  }

  async updateMine(
    userId: string,
    projectId: string,
    fields: UpdateProjectFields,
  ): Promise<Project> {
    const project = await this.requireOwnedProject(userId, projectId);
    const updated = await this.prisma.project.update({
      where: { id: project.id },
      data: {
        ...(fields.title !== undefined ? { title: fields.title } : {}),
        ...(fields.description !== undefined
          ? { description: fields.description }
          : {}),
      },
      include: projectInclude,
    });

    return toProjectView(updated, this.storage);
  }

  async replaceBlocks(
    userId: string,
    projectId: string,
    blocks: ProjectBlockInput[],
  ): Promise<Project> {
    const project = await this.requireOwnedProject(userId, projectId);
    const profile = await this.requireProfile(userId);
    const blockRows = await this.prepareBlocks(profile.id, blocks);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.projectBlock.deleteMany({ where: { projectId: project.id } });
      return tx.project.update({
        where: { id: project.id },
        data: {
          blocks: { create: blockRows },
        },
        include: projectInclude,
      });
    });

    return toProjectView(updated, this.storage);
  }

  async deleteMine(userId: string, projectId: string): Promise<void> {
    const project = await this.requireOwnedProject(userId, projectId);
    await this.prisma.project.delete({ where: { id: project.id } });
  }

  private pageProjects(
    rows: ProjectRecord[],
    limit: number,
  ): CursorPage<Project> {
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: slice.map((row) => toProjectView(row, this.storage)),
      nextCursor: hasMore ? (slice[slice.length - 1]?.id ?? null) : null,
    };
  }

  private pageSummaries(
    rows: ProjectWithProfileRecord[],
    limit: number,
  ): CursorPage<ProjectSummary> {
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: slice
        .map((row) => toProjectSummary(row, this.storage))
        .filter((row): row is ProjectSummary => row !== null),
      nextCursor: hasMore ? (slice[slice.length - 1]?.id ?? null) : null,
    };
  }

  private async prepareBlocks(profileId: string, blocks: ProjectBlockInput[]) {
    const imageIds = blocks
      .filter((block) => block.kind === 'image')
      .map((block) => block.workId);
    if (new Set(imageIds).size !== imageIds.length) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.VALIDATION_FAILED,
        'A work can appear once in a project',
      );
    }

    if (imageIds.length > 0) {
      const works = await this.prisma.work.findMany({
        where: { id: { in: imageIds }, profileId },
        select: { id: true },
      });
      if (works.length !== imageIds.length) {
        throw new ApiHttpException(
          HttpStatus.NOT_FOUND,
          API_ERROR_CODES.WORK_NOT_FOUND,
          'Work not found',
        );
      }
    }

    return blocks.map((block, position) =>
      block.kind === 'image'
        ? {
            position,
            kind: 'image',
            workId: block.workId,
            body: '',
            showTitle: block.showTitle ?? true,
          }
        : {
            position,
            kind: 'text',
            workId: null,
            body: block.body,
            showTitle: true,
          },
    );
  }

  private async requireOwnedProject(userId: string, projectId: string) {
    const profile = await this.requireProfile(userId);
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, profileId: profile.id },
      include: projectInclude,
    });

    if (!project) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROJECT_NOT_FOUND,
        'Project not found',
      );
    }

    return project;
  }

  private async requireProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }

    return profile;
  }
}
