import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser>(error: unknown, user: TUser): TUser | null {
    if (error) {
      return null;
    }
    return user || null;
  }
}
