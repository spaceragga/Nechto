export function excerpt(text: string | null | undefined, max = 160): string {
  if (!text) {
    return '';
  }

  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }

  return `${trimmed.slice(0, max).trimEnd()}…`;
}
