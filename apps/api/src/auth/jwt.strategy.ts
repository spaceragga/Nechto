import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { AuthUser } from '@nechto/api-contract';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_COOKIE, env } from '../config/env';

type JwtPayload = {
  sub: string;
  email: string;
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
  constructor() {
    super({
      jwtFromRequest: extractJwtFromCookieOrHeader,
      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET,
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
