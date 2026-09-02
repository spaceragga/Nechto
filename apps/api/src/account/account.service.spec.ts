import { API_ERROR_CODES } from '@nechto/api-contract';
import * as bcrypt from 'bcryptjs';
import { AccountService } from './account.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';
import { StorageService } from '../storage/storage.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AccountService', () => {
  const prisma = {
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };
  const profiles = {
    getMine: jest.fn(),
  };
  const storage = {
    delete: jest.fn(),
  };
  let service: AccountService;

  beforeEach(() => {
    jest.clearAllMocks();
    profiles.getMine.mockResolvedValue({ id: 'profile-1' });
    storage.delete.mockResolvedValue(undefined);
    service = new AccountService(
      prisma as unknown as PrismaService,
      profiles as unknown as ProfilesService,
      storage as unknown as StorageService,
    );
  });

  it('suspends and restores without changing publication state', async () => {
    await service.suspend('user-1');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { suspendedAt: expect.any(Date) },
    });

    await service.restore('user-1');
    expect(prisma.user.update).toHaveBeenLastCalledWith({
      where: { id: 'user-1' },
      data: { suspendedAt: null },
    });
    expect(profiles.getMine).toHaveBeenCalledTimes(2);
  });

  it('deletes the user before cleaning every stored file', async () => {
    prisma.user.findUnique.mockResolvedValue({
      passwordHash: 'hash',
      profile: {
        avatarKey: 'avatars/user-1/a.png',
        works: [
          { imageKey: 'works/profile-1/a.png' },
          { imageKey: 'works/profile-1/b.png' },
        ],
      },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await service.delete('user-1', { password: 'password123' });

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
    expect(storage.delete).toHaveBeenCalledTimes(3);
    expect(storage.delete).toHaveBeenCalledWith('avatars/user-1/a.png');
    expect(storage.delete).toHaveBeenCalledWith('works/profile-1/a.png');
    expect(storage.delete).toHaveBeenCalledWith('works/profile-1/b.png');
  });

  it('rejects deletion when the current password is incorrect', async () => {
    prisma.user.findUnique.mockResolvedValue({
      passwordHash: 'hash',
      profile: { avatarKey: null, works: [] },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.delete('user-1', { password: 'wrong-password' }),
    ).rejects.toMatchObject({
      status: 401,
      response: { code: API_ERROR_CODES.CURRENT_PASSWORD_INVALID },
    });
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('keeps deletion successful when a stored file is already missing', async () => {
    prisma.user.findUnique.mockResolvedValue({
      passwordHash: 'hash',
      profile: {
        avatarKey: 'avatars/user-1/missing.png',
        works: [],
      },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    storage.delete.mockRejectedValue(new Error('missing'));

    await expect(
      service.delete('user-1', { password: 'password123' }),
    ).resolves.toBeUndefined();
    expect(prisma.user.delete).toHaveBeenCalled();
  });
});
