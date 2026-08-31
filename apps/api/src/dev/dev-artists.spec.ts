import {
  canPublishProfile,
  profileSlugSchema,
  PUBLISH_MIN_WORKS,
} from '@nechto/api-contract';
import { DEV_ARTISTS } from './dev-artists';

describe('DEV_ARTISTS', () => {
  it('covers artist1–artist10@nechto.test with themed remote images', () => {
    expect(DEV_ARTISTS).toHaveLength(10);
    expect(DEV_ARTISTS.map((artist) => artist.email)).toEqual(
      Array.from(
        { length: 10 },
        (_, index) => `artist${index + 1}@nechto.test`,
      ),
    );

    const slugs = DEV_ARTISTS.map((artist) => artist.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const artist of DEV_ARTISTS) {
      expect(profileSlugSchema.safeParse(artist.slug).success).toBe(true);
      expect(artist.bio.length).toBeGreaterThan(80);
      expect(artist.avatarUrl.startsWith('https://')).toBe(true);
      expect(artist.works.length).toBeGreaterThanOrEqual(PUBLISH_MIN_WORKS);
      expect(
        canPublishProfile({
          displayName: artist.displayName,
          slug: artist.slug,
          acceptPolicies: true,
          workCount: artist.works.length,
        }),
      ).toBe(true);

      for (const work of artist.works) {
        expect(work.imageUrl.startsWith('https://')).toBe(true);
        expect(work.title.length).toBeGreaterThan(0);
        expect(work.title.length).toBeLessThanOrEqual(80);
        if (work.description) {
          expect(work.description.length).toBeGreaterThan(0);
          expect(work.description.length).toBeLessThanOrEqual(2000);
        }
      }
    }
  });
});
