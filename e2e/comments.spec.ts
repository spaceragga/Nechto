import { expect, test } from '@playwright/test';

test.describe('comments', () => {
  test('shows a sign-in prompt on a published work', async ({ page }) => {
    await page.goto('/kasia-voit');
    const workLink = page
      .locator('main a[href^="/kasia-voit/"]:not([href*="/p/"])')
      .first();
    await expect(workLink).toBeVisible();
    await workLink.click();

    await expect(
      page.getByRole('heading', { name: 'Комментарии' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Войдите, чтобы оставить комментарий' }),
    ).toBeVisible();
    await expect(page.getByLabel('Комментарий')).toHaveCount(0);
  });

  test('lets a signed-in visitor comment on a published work', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('artist2@nechto.test');
    await page.getByLabel('Пароль').fill('password123');
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();

    await page.goto('/kasia-voit');
    const workLink = page
      .locator('main a[href^="/kasia-voit/"]:not([href*="/p/"])')
      .first();
    await expect(workLink).toBeVisible();
    await workLink.click();

    const stamp = Date.now();
    const body = `Комментарий e2e ${stamp}`;
    await page.getByLabel('Комментарий').fill(body);
    await page.getByRole('button', { name: 'Отправить' }).click();
    await expect(page.getByText(body)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Удалить' })).toBeVisible();
  });
});
