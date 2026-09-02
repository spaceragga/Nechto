import {
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  API_ERROR_CODES,
  type AuthActionResponse,
  type AuthUser,
  type ChangePasswordDto,
  type ForgotPasswordDto,
  type LoginDto,
  type RegisterDto,
  type ResetPasswordDto,
} from '@nechto/api-contract';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { env } from '../config/env';
import { MailService } from '../mail/mail.service';
import { isUniqueConstraintError } from '../prisma/is-unique-constraint-error';
import { PrismaService } from '../prisma/prisma.service';

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          profile: {
            create: {},
          },
        },
        select: {
          id: true,
          email: true,
          authVersion: true,
        },
      });

      return this.buildAuthResponse(user);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ApiHttpException(
          HttpStatus.CONFLICT,
          API_ERROR_CODES.EMAIL_TAKEN,
          'Email is already registered',
        );
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        authVersion: true,
      },
    });

    if (!user) {
      throw new ApiHttpException(
        HttpStatus.UNAUTHORIZED,
        API_ERROR_CODES.INVALID_CREDENTIALS,
        'Invalid email or password',
      );
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new ApiHttpException(
        HttpStatus.UNAUTHORIZED,
        API_ERROR_CODES.INVALID_CREDENTIALS,
        'Invalid email or password',
      );
    }

    return this.buildAuthResponse({
      id: user.id,
      email: user.email,
      authVersion: user.authVersion,
    });
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<AuthActionResponse> {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return { ok: true };
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(
      Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60_000,
    );

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      }),
      this.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      }),
    ]);

    const localePrefix = dto.locale === 'en' ? '/en' : '';
    const resetUrl = `${env.WEB_PUBLIC_URL.replace(/\/$/, '')}${localePrefix}/reset-password?token=${encodeURIComponent(token)}`;

    try {
      await this.mail.sendPasswordReset({
        to: user.email,
        resetUrl,
        locale: dto.locale,
      });
    } catch (error) {
      await this.prisma.passwordResetToken.deleteMany({
        where: { tokenHash },
      });
      this.logger.error(
        `Password reset email delivery failed for user ${user.id}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<AuthActionResponse> {
    const tokenHash = hashResetToken(dto.token);
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { userId: true, expiresAt: true },
    });

    if (!resetToken || resetToken.expiresAt.getTime() <= Date.now()) {
      if (resetToken) {
        await this.prisma.passwordResetToken.delete({
          where: { tokenHash },
        });
      }
      throw invalidResetToken();
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.prisma.$transaction(async (transaction) => {
      const consumed = await transaction.passwordResetToken.deleteMany({
        where: {
          tokenHash,
          expiresAt: { gt: new Date() },
        },
      });
      if (consumed.count !== 1) {
        throw invalidResetToken();
      }
      await transaction.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          authVersion: { increment: 1 },
        },
      });
      await transaction.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      });
    });

    return { ok: true };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        authVersion: true,
      },
    });
    if (
      !user ||
      !(await bcrypt.compare(dto.currentPassword, user.passwordHash))
    ) {
      throw new ApiHttpException(
        HttpStatus.UNAUTHORIZED,
        API_ERROR_CODES.CURRENT_PASSWORD_INVALID,
        'Current password is incorrect',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        authVersion: { increment: 1 },
      },
      select: { id: true, email: true, authVersion: true },
    });
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    return this.buildAuthResponse(updated);
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    authVersion: number;
  }): AuthResponse {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      version: user.authVersion,
    });

    return {
      user: { id: user.id, email: user.email },
      accessToken,
    };
  }
}

function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function invalidResetToken(): ApiHttpException {
  return new ApiHttpException(
    HttpStatus.BAD_REQUEST,
    API_ERROR_CODES.INVALID_RESET_TOKEN,
    'Password reset link is invalid or expired',
  );
}
