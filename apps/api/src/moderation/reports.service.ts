import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  type AuthUser,
  type ContentReport,
  type CreateReportDto,
  type CreateReportResponse,
  type ReportTargetType,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';
import { publishedProfileWhere } from '../profiles/published-profile';
import { toContentReport } from './report.mapper';

const reportProfileSelect = {
  slug: true,
  displayName: true,
} as const;

type ResolvedTarget = {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
  profileId: string;
  ownerUserIds: string[];
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateReportDto,
    reporter: AuthUser | null,
  ): Promise<CreateReportResponse> {
    const email = dto.email ?? reporter?.email;
    if (!email) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.VALIDATION_FAILED,
        'Contact email is required',
      );
    }

    const target = await this.resolveTarget(dto);
    if (reporter && target.ownerUserIds.includes(reporter.id)) {
      throw new ApiHttpException(
        HttpStatus.FORBIDDEN,
        API_ERROR_CODES.FORBIDDEN,
        'You cannot report your own content',
      );
    }

    await this.prisma.report.create({
      data: {
        targetType: target.targetType,
        targetId: target.targetId,
        targetTitle: target.targetTitle,
        profileId: target.profileId,
        reporterId: reporter?.id,
        reason: dto.reason,
        details: dto.details,
        email,
      },
    });

    return { ok: true };
  }

  async listForDesk(): Promise<ContentReport[]> {
    const [open, resolved] = await Promise.all([
      this.prisma.report.findMany({
        where: { status: 'open' },
        include: { profile: { select: reportProfileSelect } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.findMany({
        where: { status: 'resolved' },
        include: { profile: { select: reportProfileSelect } },
        orderBy: { resolvedAt: 'desc' },
        take: 50,
      }),
    ]);

    return [...open, ...resolved].map(toContentReport);
  }

  async resolve(id: string): Promise<ContentReport> {
    const existing = await this.prisma.report.findUnique({
      where: { id },
      include: { profile: { select: reportProfileSelect } },
    });
    if (!existing) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.REPORT_NOT_FOUND,
        'Report not found',
      );
    }
    if (existing.status === 'resolved') {
      return toContentReport(existing);
    }

    const updated = await this.prisma.report.update({
      where: { id },
      data: { status: 'resolved', resolvedAt: new Date() },
      include: { profile: { select: reportProfileSelect } },
    });
    return toContentReport(updated);
  }

  private async resolveTarget(dto: CreateReportDto): Promise<ResolvedTarget> {
    switch (dto.targetType) {
      case 'profile': {
        const profile = await this.prisma.profile.findFirst({
          where: { ...publishedProfileWhere, slug: dto.slug },
          select: { id: true, userId: true, displayName: true, slug: true },
        });
        if (!profile) {
          throw new ApiHttpException(
            HttpStatus.NOT_FOUND,
            API_ERROR_CODES.PROFILE_NOT_FOUND,
            'Profile not found',
          );
        }
        return {
          targetType: 'profile',
          targetId: profile.id,
          targetTitle:
            profile.displayName?.trim() || profile.slug || profile.id,
          profileId: profile.id,
          ownerUserIds: [profile.userId],
        };
      }
      case 'work': {
        const work = await this.prisma.work.findFirst({
          where: {
            id: dto.targetId,
            hidden: false,
            profile: publishedProfileWhere,
          },
          select: {
            id: true,
            title: true,
            profileId: true,
            profile: { select: { userId: true } },
          },
        });
        if (!work) {
          throw new ApiHttpException(
            HttpStatus.NOT_FOUND,
            API_ERROR_CODES.WORK_NOT_FOUND,
            'Work not found',
          );
        }
        return {
          targetType: 'work',
          targetId: work.id,
          targetTitle: work.title,
          profileId: work.profileId,
          ownerUserIds: [work.profile.userId],
        };
      }
      case 'project': {
        const project = await this.prisma.project.findFirst({
          where: {
            id: dto.targetId,
            profile: publishedProfileWhere,
          },
          select: {
            id: true,
            title: true,
            profileId: true,
            profile: { select: { userId: true } },
          },
        });
        if (!project) {
          throw new ApiHttpException(
            HttpStatus.NOT_FOUND,
            API_ERROR_CODES.PROJECT_NOT_FOUND,
            'Project not found',
          );
        }
        return {
          targetType: 'project',
          targetId: project.id,
          targetTitle: project.title,
          profileId: project.profileId,
          ownerUserIds: [project.profile.userId],
        };
      }
      case 'article': {
        const article = await this.prisma.article.findFirst({
          where: {
            id: dto.targetId,
            publishedAt: { not: null },
            hidden: false,
            profile: publishedProfileWhere,
          },
          select: {
            id: true,
            title: true,
            profileId: true,
            profile: { select: { userId: true } },
          },
        });
        if (!article) {
          throw new ApiHttpException(
            HttpStatus.NOT_FOUND,
            API_ERROR_CODES.ARTICLE_NOT_FOUND,
            'Article not found',
          );
        }
        return {
          targetType: 'article',
          targetId: article.id,
          targetTitle: article.title,
          profileId: article.profileId,
          ownerUserIds: [article.profile.userId],
        };
      }
      case 'dialogue': {
        const dialogue = await this.prisma.dialogue.findFirst({
          where: {
            id: dto.targetId,
            publishedAt: { not: null },
            hidden: false,
          },
          select: {
            id: true,
            title: true,
            leftWork: {
              select: {
                profileId: true,
                profile: { select: { userId: true, publishedAt: true } },
              },
            },
            rightWork: {
              select: {
                profile: { select: { userId: true, publishedAt: true } },
              },
            },
          },
        });
        if (
          !dialogue ||
          !dialogue.leftWork.profile.publishedAt ||
          !dialogue.rightWork.profile.publishedAt
        ) {
          throw new ApiHttpException(
            HttpStatus.NOT_FOUND,
            API_ERROR_CODES.DIALOGUE_NOT_FOUND,
            'Dialogue not found',
          );
        }
        return {
          targetType: 'dialogue',
          targetId: dialogue.id,
          targetTitle: dialogue.title,
          profileId: dialogue.leftWork.profileId,
          ownerUserIds: [
            dialogue.leftWork.profile.userId,
            dialogue.rightWork.profile.userId,
          ],
        };
      }
    }
  }
}
