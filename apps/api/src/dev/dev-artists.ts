import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CreatorDirection } from '@nechto/api-contract';

export type DevArtistWork = {
  title: string;
  imageUrl: string;
};

export type DevArtist = {
  email: string;
  displayName: string;
  slug: string;
  bio: string;
  directions: CreatorDirection[];
  websiteUrl: string | null;
  instagramUrl: string | null;
  telegramUrl: string | null;
  avatarUrl: string;
  works: DevArtistWork[];
};

type DevArtistCatalog = {
  password: string;
  artists: DevArtist[];
};

const catalogPath = join(__dirname, 'dev-artist-catalog.json');
const catalog = JSON.parse(
  readFileSync(catalogPath, 'utf8'),
) as DevArtistCatalog;

if (!Array.isArray(catalog.artists)) {
  throw new Error(
    `Invalid artist catalog at ${catalogPath}: ${Object.keys(catalog).join(',')}`,
  );
}

export const DEV_ARTIST_PASSWORD = catalog.password;

export const DEV_ARTISTS = catalog.artists;
