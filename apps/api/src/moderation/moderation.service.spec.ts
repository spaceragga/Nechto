import { ModerationService } from './moderation.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ModerationService', () => {
  const prisma = {
    profile: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    report: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    session: { updateMany: jest.fn() },
    moderationAudit: { create: jest.fn() },
    $transaction: jest.fn(async (operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };
  const service = new ModerationService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('creates a report only for a published profile', async () => {
    prisma.profile.findFirst.mockResolvedValue({ id: 'profile-1' });
    prisma.report.create.mockResolvedValue({ id: 'report-1' });

    await service.reportProfile('artist', {
      reason: 'copyright',
      details: 'Copied work',
      reporterEmail: 'owner@example.com',
    });

    expect(prisma.report.create).toHaveBeenCalledWith({
      data: {
        profileId: 'profile-1',
        reason: 'copyright',
        details: 'Copied work',
        reporterEmail: 'owner@example.com',
      },
    });
  });

  it('does not reveal unpublished profiles', async () => {
    prisma.profile.findFirst.mockResolvedValue(null);

    await expect(
      service.reportProfile('draft', { reason: 'spam' }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('revokes every live session when a profile is suspended', async () => {
    prisma.report.findUnique.mockResolvedValue({
      id: 'report-1',
      profileId: 'profile-1',
      status: 'OPEN',
    });
    prisma.profile.findUnique.mockResolvedValue({ userId: 'user-1' });
    prisma.report.update.mockResolvedValue({});
    prisma.profile.update.mockResolvedValue({});
    prisma.session.updateMany.mockResolvedValue({ count: 2 });
    prisma.moderationAudit.create.mockResolvedValue({});

    await service.review('admin-1', 'report-1', {
      status: 'RESOLVED',
      suspendProfile: true,
      note: 'Copyright strike',
    });

    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(prisma.profile.update).toHaveBeenCalledWith({
      where: { id: 'profile-1' },
      data: { status: 'SUSPENDED' },
    });
  });

  it('does not revoke sessions when a report is dismissed', async () => {
    prisma.report.findUnique.mockResolvedValue({
      id: 'report-1',
      profileId: 'profile-1',
      status: 'OPEN',
    });
    prisma.profile.findUnique.mockResolvedValue({ userId: 'user-1' });
    prisma.report.update.mockResolvedValue({});
    prisma.moderationAudit.create.mockResolvedValue({});

    await service.review('admin-1', 'report-1', {
      status: 'DISMISSED',
      suspendProfile: false,
    });

    expect(prisma.session.updateMany).not.toHaveBeenCalled();
    expect(prisma.profile.update).not.toHaveBeenCalled();
  });

  it('does not review a report that is no longer open', async () => {
    prisma.report.findUnique.mockResolvedValue({
      id: 'report-1',
      profileId: 'profile-1',
      status: 'RESOLVED',
    });

    await expect(
      service.review('admin-1', 'report-1', {
        status: 'DISMISSED',
        suspendProfile: true,
      }),
    ).rejects.toMatchObject({ status: 404 });
    expect(prisma.session.updateMany).not.toHaveBeenCalled();
  });
});
