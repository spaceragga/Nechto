import type { Page } from '@playwright/test';

const PROFILE_PANE_COUNT = 3;

export async function nextProfilePane(page: Page) {
  await page
    .getByTestId('profile-editor')
    .getByRole('button', { name: /^(Дальше|Next)$/ })
    .click();
}

export async function previousProfilePane(page: Page) {
  await page
    .getByTestId('profile-editor')
    .getByRole('button', { name: /^(Назад|Back)$/ })
    .click();
}

export async function openProfilePane(page: Page, pane: number) {
  const editor = page.getByTestId('profile-editor');
  for (let step = 0; step < PROFILE_PANE_COUNT; step += 1) {
    const currentPane = Number(await editor.getAttribute('data-profile-pane'));
    if (currentPane === pane) {
      return;
    }
    if (currentPane < pane) {
      await nextProfilePane(page);
    } else {
      await previousProfilePane(page);
    }
  }
}

export async function openProfileVisibilityPane(page: Page) {
  await openProfilePane(page, 0);
}
