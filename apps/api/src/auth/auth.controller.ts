import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { clearAccessTokenCookie, setAccessTokenCookie } from './auth-cookies';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type ForgotPasswordDto,
  type LoginDto,
  type RegisterDto,
  type ResetPasswordDto,
  type VerifyEmailDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { env } from '../config/env';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({
    default: { limit: env.NODE_ENV === 'production' ? 10 : 100, ttl: 60_000 },
  })
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(body);
    setAccessTokenCookie(response, result.accessToken);
    return { user: result.user };
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({
    default: { limit: env.NODE_ENV === 'production' ? 5 : 100, ttl: 60_000 },
  })
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(body);
    setAccessTokenCookie(response, result.accessToken);
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.revokeSession(user.sessionId);
    clearAccessTokenCookie(response);
    return { ok: true };
  }

  @Post('forgot-password')
  @HttpCode(202)
  @Throttle({
    default: { limit: env.NODE_ENV === 'production' ? 3 : 100, ttl: 60_000 },
  })
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema))
    body: ForgotPasswordDto,
  ) {
    await this.authService.forgotPassword(body);
    return { ok: true };
  }

  @Post('reset-password')
  @HttpCode(200)
  @Throttle({
    default: { limit: env.NODE_ENV === 'production' ? 5 : 100, ttl: 60_000 },
  })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(body);
    return { ok: true };
  }

  @Post('verify-email')
  @HttpCode(200)
  async verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) body: VerifyEmailDto,
  ) {
    await this.authService.verifyEmail(body);
    return { ok: true };
  }

  @Post('resend-verification')
  @HttpCode(202)
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: env.NODE_ENV === 'production' ? 3 : 100, ttl: 60_000 },
  })
  async resendVerification(@CurrentUser() user: AuthUser) {
    await this.authService.resendVerification(user.id);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthUser) {
    return {
      user: await this.authService.getProfile(user.id),
    };
  }
}
