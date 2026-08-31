import type { Page } from '@playwright/test';

export async function nextProfilePane(page: Page) {
  await page
    .getByTestId('profile-editor')
    .getByRole('button', { name: /^(Дальше|Next)$/ })
    .click();
}

export async function openProfilePane(page: Page, pane: number) {
  const editor = page.getByTestId('profile-editor');
  for (let step = 0; step < 4; step += 1) {
    if ((await editor.getAttribute('data-profile-pane')) === String(pane)) {
      return;
    }
    await nextProfilePane(page);
  }
}

export async function openProfileVisibilityPane(page: Page) {
  await openProfilePane(page, 2);
}
