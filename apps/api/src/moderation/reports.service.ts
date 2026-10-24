import { HttpStatus, Injectable } from '@nestjs/common';
import {
  API_ERROR_CODES,
  type AuthUser,
  type CreateReportDto,
  type CreateReportResponse,
  type ProfileReport,
} from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';
import { publishedProfileWhere } from '../profiles/published-profile';
import { toProfileReport } from './report.mapper';

const reportProfileSelect = {
  slug: true,
  displayName: true,
} as const;

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

    const profile = await this.prisma.profile.findFirst({
      where: { ...publishedProfileWhere, slug: dto.slug },
      select: { id: true, userId: true },
    });
    if (!profile) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        API_ERROR_CODES.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
    if (reporter && profile.userId === reporter.id) {
      throw new ApiHttpException(
        HttpStatus.FORBIDDEN,
        API_ERROR_CODES.FORBIDDEN,
        'You cannot report your own profile',
      );
    }

    await this.prisma.report.create({
      data: {
        profileId: profile.id,
        reporterId: reporter?.id,
        reason: dto.reason,
        details: dto.details,
        email,
      },
    });

    return { ok: true };
  }

  async listForDesk(): Promise<ProfileReport[]> {
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

    return [...open, ...resolved].map(toProfileReport);
  }

  async resolve(id: string): Promise<ProfileReport> {
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
      return toProfileReport(existing);
    }

    const updated = await this.prisma.report.update({
      where: { id },
      data: { status: 'resolved', resolvedAt: new Date() },
      include: { profile: { select: reportProfileSelect } },
    });
    return toProfileReport(updated);
  }
}
