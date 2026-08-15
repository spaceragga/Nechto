import { jwtExpiresInToMs } from './env';

describe('jwtExpiresInToMs', () => {
  it('parses supported duration units', () => {
    expect(jwtExpiresInToMs('30s')).toBe(30_000);
    expect(jwtExpiresInToMs('15m')).toBe(15 * 60_000);
    expect(jwtExpiresInToMs('12h')).toBe(12 * 3_600_000);
    expect(jwtExpiresInToMs('7d')).toBe(7 * 86_400_000);
  });
});
