import { API_ERROR_CODES } from '@nechto/api-contract';
import { PrismaService } from '../prisma/prisma.service';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  const prisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  let service: AdminUsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminUsersService(prisma as unknown as PrismaService);
  });

  it('lists everyone until a name or email search is set', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'u1',
        email: 'a@nechto.test',
        isCurator: false,
        isModerator: true,
        isAdmin: false,
        profile: { displayName: 'Ada' },
      },
    ]);

    await expect(service.list({})).resolves.toEqual({
      items: [
        {
          id: 'u1',
          email: 'a@nechto.test',
          displayName: 'Ada',
          isCurator: false,
          isModerator: true,
          isAdmin: false,
        },
      ],
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      }),
    );
    expect(prisma.user.findMany.mock.calls[0][0]).not.toHaveProperty('take');

    await expect(service.list({ email: 'a@' })).resolves.toEqual({
      items: [
        {
          id: 'u1',
          email: 'a@nechto.test',
          displayName: 'Ada',
          isCurator: false,
          isModerator: true,
          isAdmin: false,
        },
      ],
    });
    expect(prisma.user.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: {
          email: { contains: 'a@', mode: 'insensitive' },
        },
        take: 50,
      }),
    );
  });

  it('updates flags and rejects missing users', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.updateAccess('missing', {
        isCurator: true,
        isModerator: false,
        isAdmin: false,
      }),
    ).rejects.toMatchObject({
      status: 404,
      response: { code: API_ERROR_CODES.USER_NOT_FOUND },
    });
    expect(prisma.user.update).not.toHaveBeenCalled();

    prisma.user.findUnique.mockResolvedValueOnce({ id: 'u1' });
    prisma.user.update.mockResolvedValueOnce({
      id: 'u1',
      email: 'a@nechto.test',
      isCurator: true,
      isModerator: false,
      isAdmin: false,
      profile: null,
    });

    await expect(
      service.updateAccess('u1', {
        isCurator: true,
        isModerator: false,
        isAdmin: false,
      }),
    ).resolves.toEqual({
      id: 'u1',
      email: 'a@nechto.test',
      displayName: null,
      isCurator: true,
      isModerator: false,
      isAdmin: false,
    });
  });
});
