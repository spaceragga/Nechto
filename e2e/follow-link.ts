import type { Locator, Page } from '@playwright/test';

export async function navigate(page: Page, href: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto(href);
      return;
    } catch (error) {
      const message = String(error);
      const transient =
        message.includes('net::ERR_ABORTED') ||
        message.includes('net::ERR_EMPTY_RESPONSE');
      if (attempt === 1 || !transient) {
        throw error;
      }
    }
  }
}

export async function followLink(page: Page, link: Locator) {
  await link.waitFor({ state: 'visible' });
  const href = await link.getAttribute('href');
  if (!href) {
    throw new Error('Expected link to have an href');
  }
  await navigate(page, href);
}
