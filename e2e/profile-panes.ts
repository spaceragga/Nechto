import type { Page } from '@playwright/test';

export async function nextProfilePane(page: Page) {
  await page
    .getByTestId('profile-editor')
    .getByRole('button', { name: /^(Дальше|Next)$/ })
    .click();
}

export async function openProfileVisibilityPane(page: Page) {
  const editor = page.getByTestId('profile-editor');
  for (let step = 0; step < 2; step += 1) {
    if ((await editor.getAttribute('data-profile-pane')) === '2') {
      return;
    }
    await nextProfilePane(page);
  }
}
