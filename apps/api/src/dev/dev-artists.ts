import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CreatorDirection } from '@nechto/api-contract';

export type DevArtistWork = {
  title: string;
  imageUrl: string;
  description?: string;
};

export type DevArtistSeriesImageBlock = {
  kind: 'image';
  title: string;
  imageUrl: string;
  description?: string;
  showTitle?: boolean;
};

export type DevArtistSeriesTextBlock = {
  kind: 'text';
  body: string;
};

export type DevArtistSeriesBlock =
  DevArtistSeriesImageBlock | DevArtistSeriesTextBlock;

export type DevArtistSeries = {
  title: string;
  description?: string;
  blocks: DevArtistSeriesBlock[];
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
  series?: DevArtistSeries[];
};

type DevArtistCatalog = {
  password: string;
  artists: DevArtist[];
};

const catalogPath = join(__dirname, 'dev-artist-catalog.json');
const seriesPath = join(__dirname, 'dev-artist-series.json');
const catalog = JSON.parse(
  readFileSync(catalogPath, 'utf8'),
) as DevArtistCatalog;
const seriesByEmail = JSON.parse(readFileSync(seriesPath, 'utf8')) as Record<
  string,
  DevArtistSeries | DevArtistSeries[]
>;

function seriesList(
  value: DevArtistSeries | DevArtistSeries[] | undefined,
): DevArtistSeries[] | undefined {
  if (!value) {
    return undefined;
  }
  const list = Array.isArray(value) ? value : [value];
  return list.length > 0 ? list : undefined;
}

if (!Array.isArray(catalog.artists)) {
  throw new Error(
    `Invalid artist catalog at ${catalogPath}: ${Object.keys(catalog).join(',')}`,
  );
}

export const DEV_ARTIST_PASSWORD = catalog.password;

export const DEV_ARTISTS = catalog.artists.map((artist) => ({
  ...artist,
  series: seriesList(seriesByEmail[artist.email]),
}));
