import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import {
  API_ERROR_CODES,
  type AuthUser,
  type ForgotPasswordDto,
  type LoginDto,
  type RegisterDto,
  type ResetPasswordDto,
  type VerifyEmailDto,
} from '@nechto/api-contract';
import * as bcrypt from 'bcryptjs';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { env, jwtExpiresInToMs } from '../config/env';
import { MailService } from '../mail/mail.service';
import { isUniqueConstraintError } from '../prisma/is-unique-constraint-error';
import { PrismaService } from '../prisma/prisma.service';

const DUMMY_PASSWORD_HASH =
  '$2b$10$DEghbfO9B8nuy5Y5jq.8ke3jrCC2Ovo.xezfgv.MBV5ckQ/aOTQ7W';

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
        },
      });

      await this.issueVerificationEmail(user).catch((error: unknown) => {
        this.logger.error(
          `Failed to send verification email for user ${user.id}`,
          error instanceof Error ? error.stack : undefined,
        );
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
    const user = await this.prisma.user.findUnique({ where: { email } });

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordMatches) {
      throw new ApiHttpException(
        HttpStatus.UNAUTHORIZED,
        API_ERROR_CODES.INVALID_CREDENTIALS,
        'Invalid email or password',
      );
    }

    return this.buildAuthResponse({
      id: user.id,
      email: user.email,
    });
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new ApiHttpException(
        HttpStatus.UNAUTHORIZED,
        API_ERROR_CODES.AUTHENTICATION_REQUIRED,
        'Authentication required',
      );
    }

    return user;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true, email: true },
    });
    if (!user) {
      await bcrypt.compare(dto.email, DUMMY_PASSWORD_HASH);
      return;
    }
    const token = this.createToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + 30 * 60_000),
      },
    });
    await this.mail.sendPasswordReset(user.email, token).catch((error) => {
      this.logger.error(
        `Failed to send password reset for user ${user.id}`,
        error instanceof Error ? error.stack : undefined,
      );
    });
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.hashToken(dto.token) },
    });
    if (!token || token.usedAt || token.expiresAt <= new Date()) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.VALIDATION_FAILED,
        'Password reset token is invalid or expired',
      );
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.session.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    const token = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash: this.hashToken(dto.token) },
    });
    if (!token || token.usedAt || token.expiresAt <= new Date()) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.VALIDATION_FAILED,
        'Email verification token is invalid or expired',
      );
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  async resendVerification(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerifiedAt: true },
    });
    if (!user || user.emailVerifiedAt) return;
    await this.issueVerificationEmail(user);
  }

  private async issueVerificationEmail(user: AuthUser): Promise<void> {
    const token = this.createToken();
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + 24 * 60 * 60_000),
      },
    });
    await this.mail.sendEmailVerification(user.email, token);
  }

  private createToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async buildAuthResponse(user: AuthUser): Promise<AuthResponse> {
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + jwtExpiresInToMs(env.JWT_EXPIRES_IN)),
      },
      select: { id: true },
    });
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      sid: session.id,
    });

    return { user, accessToken };
  }
}
