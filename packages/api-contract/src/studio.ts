import type { CreatorDirection } from './directions';
import type { Work } from './work';

export const STUDIO_TITLE_MAX = 80;
export const STUDIO_DESCRIPTION_MAX = 2000;

export type StudioProfileSummary = {
  profileId: string;
  slug: string;
  displayName: string;
  /** Studio title; falls back to display name when empty. */
  title: string;
  description: string;
  coverUrl: string | null;
  bio: string;
  avatarUrl: string | null;
  directions: CreatorDirection[];
  themes: CreatorDirection[];
  studioListedAt: string | null;
  studioFeaturedAt: string | null;
  studioHidden: boolean;
  latestWorks: Work[];
};

export function canListProfileInStudio(input: {
  publishedAt: string | null;
  slug: string | null;
  studioDescription: string | null | undefined;
  studioCoverKey: string | null | undefined;
}): boolean {
  return Boolean(
    input.publishedAt &&
    input.slug?.trim() &&
    input.studioDescription?.trim() &&
    input.studioCoverKey?.trim(),
  );
}
