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
    };
    session: {
      create: jest.Mock;
      updateMany: jest.Mock;
    };
    emailVerificationToken: {
      create: jest.Mock;
    };
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      session: {
        create: jest.fn().mockResolvedValue({ id: 'session-1' }),
        updateMany: jest.fn(),
      },
      emailVerificationToken: {
        create: jest.fn().mockResolvedValue({ id: 'verification-1' }),
      },
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
    };
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      {
        sendEmailVerification: jest.fn().mockResolvedValue(undefined),
        sendPasswordReset: jest.fn().mockResolvedValue(undefined),
      } as unknown as MailService,
    );
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates a user and returns a token payload', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'artist@nechto.test',
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
        select: { id: true, email: true },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'artist@nechto.test',
        sid: 'session-1',
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

    it('performs a dummy password comparison for unknown emails', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'missing@nechto.test',
          password: 'wrong-password',
        }),
      ).rejects.toMatchObject({ status: 401 });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong-password',
        expect.stringMatching(/^\$2b\$10\$/),
      );
    });
  });
});
