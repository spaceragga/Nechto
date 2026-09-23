import { emptyStaffAccess } from '@nechto/api-contract';
import { toAuthUser } from './to-auth-user';

describe('toAuthUser', () => {
  it('fills missing staff flags with false', () => {
    expect(toAuthUser({ id: 'u1', email: 'a@nechto.test' })).toEqual({
      id: 'u1',
      email: 'a@nechto.test',
      ...emptyStaffAccess(),
    });
  });

  it('keeps granted flags', () => {
    expect(
      toAuthUser({
        id: 'u1',
        email: 'a@nechto.test',
        isAdmin: true,
        isCurator: true,
        isModerator: false,
      }),
    ).toEqual({
      id: 'u1',
      email: 'a@nechto.test',
      isCurator: true,
      isModerator: false,
      isAdmin: true,
    });
  });
});
