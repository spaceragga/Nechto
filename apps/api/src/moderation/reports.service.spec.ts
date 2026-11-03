import { API_ERROR_CODES } from '@nechto/api-contract';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportsService', () => {
  const prisma = {
    profile: { findFirst: jest.fn() },
    work: { findFirst: jest.fn() },
    project: { findFirst: jest.fn() },
    article: { findFirst: jest.fn() },
    dialogue: { findFirst: jest.fn() },
    report: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService(prisma as unknown as PrismaService);
  });

  it('creates a report for a published profile', async () => {
    prisma.profile.findFirst.mockResolvedValue({
      id: 'profile-1',
      userId: 'author-1',
      displayName: 'Кася',
      slug: 'kasia-voit',
    });
    prisma.report.create.mockResolvedValue({ id: 'r1' });

    await expect(
      service.create(
        {
          targetType: 'profile',
          slug: 'kasia-voit',
          reason: 'spam',
          details: 'bots',
          email: 'visitor@nechto.test',
        },
        null,
      ),
    ).resolves.toEqual({ ok: true });

    expect(prisma.report.create).toHaveBeenCalledWith({
      data: {
        targetType: 'profile',
        targetId: 'profile-1',
        targetTitle: 'Кася',
        profileId: 'profile-1',
        reporterId: undefined,
        reason: 'spam',
        details: 'bots',
        email: 'visitor@nechto.test',
      },
    });
  });

  it('creates a report for a published work', async () => {
    prisma.work.findFirst.mockResolvedValue({
      id: 'work-1',
      title: 'Двор',
      profileId: 'profile-1',
      profile: { userId: 'author-1' },
    });
    prisma.report.create.mockResolvedValue({ id: 'r2' });

    await expect(
      service.create(
        {
          targetType: 'work',
          targetId: 'work-1',
          reason: 'copyright',
          details: '',
          email: 'visitor@nechto.test',
        },
        null,
      ),
    ).resolves.toEqual({ ok: true });

    expect(prisma.report.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        targetType: 'work',
        targetId: 'work-1',
        targetTitle: 'Двор',
        profileId: 'profile-1',
      }),
    });
  });

  it('rejects a report without contact email', async () => {
    await expect(
      service.create(
        {
          targetType: 'profile',
          slug: 'kasia-voit',
          reason: 'other',
          details: '',
        },
        null,
      ),
    ).rejects.toMatchObject({
      response: { code: API_ERROR_CODES.VALIDATION_FAILED },
    });
    expect(prisma.report.create).not.toHaveBeenCalled();
  });

  it('rejects a self-report', async () => {
    prisma.profile.findFirst.mockResolvedValue({
      id: 'profile-1',
      userId: 'author-1',
      displayName: 'Кася',
      slug: 'kasia-voit',
    });

    await expect(
      service.create(
        {
          targetType: 'profile',
          slug: 'kasia-voit',
          reason: 'spam',
          details: '',
        },
        {
          id: 'author-1',
          email: 'author@nechto.test',
          isCurator: false,
          isModerator: false,
          isAdmin: false,
        },
      ),
    ).rejects.toMatchObject({
      response: { code: API_ERROR_CODES.FORBIDDEN },
    });
  });

  it('resolves an open report', async () => {
    const row = {
      id: 'r1',
      targetType: 'profile',
      targetId: 'profile-1',
      targetTitle: 'Кася',
      reason: 'spam',
      details: '',
      email: 'a@nechto.test',
      status: 'open',
      createdAt: new Date('2026-10-24T00:00:00.000Z'),
      resolvedAt: null,
      profile: { slug: 'kasia-voit', displayName: 'Кася' },
    };
    prisma.report.findUnique.mockResolvedValue(row);
    prisma.report.update.mockResolvedValue({
      ...row,
      status: 'resolved',
      resolvedAt: new Date('2026-10-24T01:00:00.000Z'),
    });

    await expect(service.resolve('r1')).resolves.toMatchObject({
      id: 'r1',
      status: 'resolved',
      targetType: 'profile',
      profile: { slug: 'kasia-voit' },
    });
  });
});
