import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { AuthUser } from '@nechto/api-contract';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_COOKIE, env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_USER_SELECT, toAuthUser } from './to-auth-user';

type JwtPayload = {
  sub: string;
  email: string;
  version?: number;
};

function extractJwtFromCookieOrHeader(request: Request): string | null {
  const cookieToken = request.cookies?.[ACCESS_TOKEN_COOKIE];
  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }

  return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: extractJwtFromCookieOrHeader,
      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        ...AUTH_USER_SELECT,
        authVersion: true,
      },
    });
    if (!user || user.authVersion !== (payload.version ?? 0)) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    return toAuthUser(user);
  }
}
