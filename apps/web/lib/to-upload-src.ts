/** Point API upload URLs at the current origin so Next can proxy /uploads. */
export function toUploadSrc(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  try {
    const parsed = new URL(url, 'http://local.invalid');
    if (parsed.pathname.startsWith('/uploads/')) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return url;
  }

  return url;
}
