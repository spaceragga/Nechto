import { profileSlugSchema } from '@nechto/api-contract';

describe('profileSlugSchema', () => {
  it('accepts a normal creator slug', () => {
    expect(profileSlugSchema.safeParse('taras-litvin').success).toBe(true);
  });

  it('rejects app route names so public pages can live at /{slug}', () => {
    expect(profileSlugSchema.safeParse('profile').success).toBe(false);
    expect(profileSlugSchema.safeParse('creators').success).toBe(false);
    expect(profileSlugSchema.safeParse('top-works').success).toBe(false);
    expect(profileSlugSchema.safeParse('forgot-password').success).toBe(false);
    expect(profileSlugSchema.safeParse('community-guidelines').success).toBe(
      false,
    );
  });
});
