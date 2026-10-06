export function profilePath(slug: string): string {
  return `/${slug}`;
}

export function workPath(slug: string, workId: string): string {
  return `${profilePath(slug)}/${workId}`;
}

export function projectPath(slug: string, projectId: string): string {
  return `${profilePath(slug)}/p/${projectId}`;
}

export function articlePath(articleId: string): string {
  return `/journal/${articleId}`;
}

export function dialoguePath(dialogueId: string): string {
  return `/dialogue/${dialogueId}`;
}

export function studioPath(slug: string): string {
  return `/studio/${slug}`;
}
