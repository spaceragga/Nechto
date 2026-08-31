export function profilePath(slug: string): string {
  return `/${slug}`;
}

export function workPath(slug: string, workId: string): string {
  return `${profilePath(slug)}/${workId}`;
}
