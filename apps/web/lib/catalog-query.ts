import { CREATOR_DIRECTION_IDS } from '@/lib/creator-directions';

export function parseCatalogDirection(
  value: string | undefined,
): (typeof CREATOR_DIRECTION_IDS)[number] | undefined {
  return CREATOR_DIRECTION_IDS.find((item) => item === value);
}

export function catalogHref(
  path: string,
  query: { direction?: string; cursor?: string | null } = {},
): string {
  const params = new URLSearchParams();
  if (query.direction) {
    params.set('direction', query.direction);
  }
  if (query.cursor) {
    params.set('cursor', query.cursor);
  }
  const serialized = params.toString();
  return serialized ? `${path}?${serialized}` : path;
}
