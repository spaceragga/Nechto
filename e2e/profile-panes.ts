import type { Page } from '@playwright/test';

const PROFILE_PANE_COUNT = 4;

export async function nextProfilePane(page: Page) {
  await page
    .getByTestId('profile-editor')
    .getByRole('button', { name: /^(Дальше|Next)$/ })
    .click();
}

export async function openProfilePane(page: Page, pane: number) {
  const editor = page.getByTestId('profile-editor');
  for (let step = 0; step < PROFILE_PANE_COUNT; step += 1) {
    if ((await editor.getAttribute('data-profile-pane')) === String(pane)) {
      return;
    }
    await nextProfilePane(page);
  }
}

export async function openProfileVisibilityPane(page: Page) {
  await openProfilePane(page, 2);
}
