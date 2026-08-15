const DURATION_MS: Record<'s' | 'm' | 'h' | 'd', number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/** Convert validated JWT_EXPIRES_IN (e.g. 7d) to cookie maxAge milliseconds. */
export function jwtExpiresInToMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    throw new Error(`Invalid JWT_EXPIRES_IN: ${value}`);
  }
  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof DURATION_MS;
  return amount * DURATION_MS[unit];
}
