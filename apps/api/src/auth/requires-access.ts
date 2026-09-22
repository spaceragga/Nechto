import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthUser } from '@nechto/api-contract';
import { API_ERROR_CODES } from '@nechto/api-contract';
import type { Request } from 'express';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { JwtAuthGuard } from './jwt-auth.guard';

export const STAFF_ACCESS_KEY = 'staffAccess';

export type StaffAccessFlag = 'isCurator' | 'isModerator' | 'isAdmin';

const DENY_MESSAGE: Record<StaffAccessFlag, string> = {
  isCurator: 'Curator access required',
  isModerator: 'Moderator access required',
  isAdmin: 'Admin access required',
};

type RequestWithUser = Request & {
  user?: AuthUser;
};

@Injectable()
export class StaffAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const flag = this.reflector.getAllAndOverride<StaffAccessFlag>(
      STAFF_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!flag) {
      return true;
    }

    const user = context.switchToHttp().getRequest<RequestWithUser>().user;
    if (!user?.[flag]) {
      throw new ApiHttpException(
        HttpStatus.FORBIDDEN,
        API_ERROR_CODES.FORBIDDEN,
        DENY_MESSAGE[flag],
      );
    }
    return true;
  }
}

function requiresFlag(flag: StaffAccessFlag) {
  return applyDecorators(
    SetMetadata(STAFF_ACCESS_KEY, flag),
    UseGuards(JwtAuthGuard, StaffAccessGuard),
  );
}

export const RequiresCurator = () => requiresFlag('isCurator');
export const RequiresModerator = () => requiresFlag('isModerator');
export const RequiresAdmin = () => requiresFlag('isAdmin');
