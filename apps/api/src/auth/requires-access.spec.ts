import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_ERROR_CODES, emptyStaffAccess } from '@nechto/api-contract';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { StaffAccessGuard, type StaffAccessFlag } from './requires-access';
import { toAuthUser } from './to-auth-user';

function contextWithUser(
  user: ReturnType<typeof toAuthUser> | undefined,
): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as ExecutionContext;
}

function guardFor(flag: StaffAccessFlag) {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(flag),
  };
  return new StaffAccessGuard(reflector as unknown as Reflector);
}

describe('StaffAccessGuard', () => {
  it('allows the matching flag and rejects the others', () => {
    const admin = toAuthUser({
      id: 'u1',
      email: 'a@nechto.test',
      isAdmin: true,
    });

    expect(guardFor('isAdmin').canActivate(contextWithUser(admin))).toBe(true);
    expect(() =>
      guardFor('isCurator').canActivate(contextWithUser(admin)),
    ).toThrow(ApiHttpException);
    try {
      guardFor('isCurator').canActivate(contextWithUser(admin));
    } catch (error) {
      expect((error as ApiHttpException).getStatus()).toBe(
        HttpStatus.FORBIDDEN,
      );
      expect((error as ApiHttpException).getResponse()).toMatchObject({
        code: API_ERROR_CODES.FORBIDDEN,
        message: 'Curator access required',
      });
    }
    expect(() =>
      guardFor('isModerator').canActivate(contextWithUser(admin)),
    ).toThrow('Moderator access required');
    expect(() =>
      guardFor('isAdmin').canActivate(
        contextWithUser(toAuthUser({ id: 'u2', email: 'b@nechto.test' })),
      ),
    ).toThrow('Admin access required');
  });

  it('passes through when no flag metadata is set', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    };
    const guard = new StaffAccessGuard(reflector as unknown as Reflector);
    expect(
      guard.canActivate(
        contextWithUser({
          id: 'u1',
          email: 'a@nechto.test',
          ...emptyStaffAccess(),
        }),
      ),
    ).toBe(true);
  });
});
