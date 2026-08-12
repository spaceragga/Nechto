import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export type AuthUser = {
  id: string;
  email: string;
};

type RequestWithUser = Request & {
  user?: AuthUser;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new Error('CurrentUser used without authenticated request');
    }
    return request.user;
  },
);
