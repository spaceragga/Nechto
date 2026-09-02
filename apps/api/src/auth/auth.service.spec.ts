import { JwtService } from '@nestjs/jwt';
import { API_ERROR_CODES } from '@nechto/api-contract';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    passwordResetToken: {
      findUnique: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };
  let mail: { sendPasswordReset: jest.Mock };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      passwordResetToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(async (operation: unknown) => {
        if (typeof operation === 'function') {
          return (
            operation as (transaction: typeof prisma) => Promise<unknown>
          )(prisma);
        }
        return Promise.all(operation as Promise<unknown>[]);
      }),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
    };
    mail = {
      sendPasswordReset: jest.fn().mockResolvedValue(undefined),
    };
    prisma.passwordResetToken.deleteMany.mockResolvedValue({ count: 1 });
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      mail as unknown as MailService,
    );
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates a user and returns a token payload', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'artist@nechto.test',
        authVersion: 0,
      });

      await expect(
        service.register({
          email: 'Artist@Nechto.test',
          password: 'password123',
        }),
      ).resolves.toEqual({
        user: { id: 'user-1', email: 'artist@nechto.test' },
        accessToken: 'test-token',
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'artist@nechto.test',
          passwordHash: 'hashed',
          profile: {
            create: {},
          },
        },
        select: { id: true, email: true, authVersion: true },
      });
    });

    it('rejects duplicate emails via unique constraint', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.register({
          email: 'artist@nechto.test',
          password: 'password123',
        }),
      ).rejects.toMatchObject({
        status: 409,
        response: { code: API_ERROR_CODES.EMAIL_TAKEN },
      });
    });
  });

  describe('login', () => {
    it('returns a token for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'artist@nechto.test',
        passwordHash: 'hashed',
        authVersion: 0,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({
          email: 'artist@nechto.test',
          password: 'password123',
        }),
      ).resolves.toEqual({
        user: { id: 'user-1', email: 'artist@nechto.test' },
        accessToken: 'test-token',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'artist@nechto.test',
        version: 0,
      });
    });

    it('rejects invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'artist@nechto.test',
        passwordHash: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'artist@nechto.test',
          password: 'wrong-password',
        }),
      ).rejects.toMatchObject({
        status: 401,
        response: { code: API_ERROR_CODES.INVALID_CREDENTIALS },
      });
    });
  });

  describe('password recovery', () => {
    it('returns generic success without sending for unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.forgotPassword({
          email: 'missing@nechto.test',
          locale: 'en',
        }),
      ).resolves.toEqual({ ok: true });
      expect(mail.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('stores only a token hash and sends the reset URL', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'artist@nechto.test',
      });

      await service.forgotPassword({
        email: 'Artist@Nechto.test',
        locale: 'en',
      });

      const data = prisma.passwordResetToken.create.mock.calls[0]?.[0].data;
      expect(data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
      expect(data).not.toHaveProperty('token');
      expect(mail.sendPasswordReset).toHaveBeenCalledWith({
        to: 'artist@nechto.test',
        locale: 'en',
        resetUrl: expect.stringMatching(
          /\/en\/reset-password\?token=[A-Za-z0-9_-]+$/,
        ),
      });
    });

    it('resets the password once and invalidates sessions', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 60_000),
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      await expect(
        service.resetPassword({
          token: 'a'.repeat(43),
          password: 'new-password',
        }),
      ).resolves.toEqual({ ok: true });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          passwordHash: 'new-hash',
          authVersion: { increment: 1 },
        },
      });
      expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('rejects expired reset tokens', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 1),
      });

      await expect(
        service.resetPassword({
          token: 'a'.repeat(43),
          password: 'new-password',
        }),
      ).rejects.toMatchObject({
        status: 400,
        response: { code: API_ERROR_CODES.INVALID_RESET_TOKEN },
      });
    });
  });

  describe('changePassword', () => {
    it('requires the current password and returns a fresh token', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'artist@nechto.test',
        passwordHash: 'old-hash',
        authVersion: 2,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        email: 'artist@nechto.test',
        authVersion: 3,
      });

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'password123',
          newPassword: 'new-password',
        }),
      ).resolves.toEqual({
        user: { id: 'user-1', email: 'artist@nechto.test' },
        accessToken: 'test-token',
      });
      expect(jwtService.sign).toHaveBeenLastCalledWith({
        sub: 'user-1',
        email: 'artist@nechto.test',
        version: 3,
      });
    });

    it('rejects an incorrect current password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'artist@nechto.test',
        passwordHash: 'old-hash',
        authVersion: 2,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'wrong-password',
          newPassword: 'new-password',
        }),
      ).rejects.toMatchObject({
        status: 401,
        response: { code: API_ERROR_CODES.CURRENT_PASSWORD_INVALID },
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
