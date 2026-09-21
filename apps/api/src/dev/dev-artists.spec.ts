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
          expect(work.description.length).toBeGreaterThan(80);
          expect(work.description.length).toBeLessThanOrEqual(2000);
        }
      }
    }

    const allWorks = DEV_ARTISTS.flatMap((artist) => artist.works);
    const described = allWorks.filter((work) => work.description?.trim());
    expect(described.length).toBeGreaterThan(allWorks.length / 2);
  });

  it('gives about seventy percent of artists a process or interior series', () => {
    const withSeries = DEV_ARTISTS.filter((artist) => artist.series);
    expect(withSeries).toHaveLength(7);

    const described = withSeries.filter((artist) =>
      artist.series?.some((item) => item.description?.trim()),
    );
    expect(described.length).toBeGreaterThanOrEqual(3);
    expect(described.length).toBeLessThan(withSeries.length);

    const kasia = DEV_ARTISTS.find((artist) => artist.slug === 'kasia-voit');
    expect(kasia?.series).toHaveLength(3);

    for (const artist of withSeries) {
      expect(artist.series?.length).toBeGreaterThan(0);
      const vitrineUrls = new Set(artist.works.map((work) => work.imageUrl));
      const vitrineTitles = new Set(artist.works.map((work) => work.title));

      for (const series of artist.series ?? []) {
        expect(series.title.length).toBeGreaterThan(0);
        expect(series.title.length).toBeLessThanOrEqual(80);
        if (series.description) {
          expect(series.description.length).toBeGreaterThan(80);
          expect(series.description.length).toBeLessThanOrEqual(2000);
        }

        const images = series.blocks.filter((block) => block.kind === 'image');
        const texts = series.blocks.filter((block) => block.kind === 'text');
        expect(images.length).toBeGreaterThanOrEqual(4);

        for (const frame of images) {
          expect(frame.imageUrl.startsWith('https://')).toBe(true);
          expect(vitrineUrls.has(frame.imageUrl)).toBe(false);
          expect(vitrineTitles.has(frame.title)).toBe(false);
          expect(frame.title.length).toBeGreaterThan(0);
          expect(frame.title.length).toBeLessThanOrEqual(80);
          if (frame.description) {
            expect(frame.description.length).toBeGreaterThan(80);
            expect(frame.description.length).toBeLessThanOrEqual(2000);
          }
        }

        for (const note of texts) {
          expect(note.body.length).toBeGreaterThan(40);
          expect(note.body.length).toBeLessThanOrEqual(2000);
        }
      }
    }
  });
});
