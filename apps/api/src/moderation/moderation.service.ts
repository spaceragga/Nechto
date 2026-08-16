import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  type ModerationReport,
  type ReportProfileDto,
  type ReviewReportDto,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async reportProfile(slug: string, dto: ReportProfileDto): Promise<void> {
    const profile = await this.prisma.profile.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (!profile) throw this.notFound();
    await this.prisma.report.create({
      data: { profileId: profile.id, ...dto },
    });
  }

  async listOpenReports(): Promise<ModerationReport[]> {
    const reports = await this.prisma.report.findMany({
      where: { status: 'OPEN' },
      include: { profile: { select: { slug: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    return reports.map((report) => ({
      id: report.id,
      profileId: report.profileId,
      profileSlug: report.profile.slug,
      reason: report.reason,
      details: report.details,
      reporterEmail: report.reporterEmail,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
    }));
  }

  async review(
    moderatorId: string,
    reportId: string,
    dto: ReviewReportDto,
  ): Promise<void> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, profileId: true, status: true },
    });
    if (!report || report.status !== 'OPEN') throw this.notFound();

    const profile = await this.prisma.profile.findUnique({
      where: { id: report.profileId },
      select: { userId: true },
    });
    if (!profile) throw this.notFound();

    await this.prisma.$transaction([
      this.prisma.report.update({
        where: { id: report.id },
        data: { status: dto.status, reviewedAt: new Date() },
      }),
      ...(dto.suspendProfile
        ? [
            this.prisma.profile.update({
              where: { id: report.profileId },
              data: { status: 'SUSPENDED' as const },
            }),
            this.prisma.session.updateMany({
              where: { userId: profile.userId, revokedAt: null },
              data: { revokedAt: new Date() },
            }),
          ]
        : []),
      this.prisma.moderationAudit.create({
        data: {
          moderatorId,
          profileId: report.profileId,
          action: dto.suspendProfile ? 'SUSPEND_PROFILE' : dto.status,
          reason: dto.note,
        },
      }),
    ]);
  }

  private notFound(): ApiHttpException {
    return new ApiHttpException(
      HttpStatus.NOT_FOUND,
      API_ERROR_CODES.NOT_FOUND,
      'Report or profile not found',
    );
  }
}
