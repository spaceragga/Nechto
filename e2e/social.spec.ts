import { expect, test } from '@playwright/test';

test.describe('social engagement', () => {
  test('hides engagement counts until the snapshot arrives', async ({
    page,
  }) => {
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/social/views', async (route) => {
      await held;
      await route.continue();
    });

    await page.goto('/kasia-voit');
    const workLink = page
      .locator('main a[href^="/kasia-voit/"]:not([href*="/p/"])')
      .first();
    await expect(workLink).toBeVisible();
    await workLink.click();

    const thread = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Комментарии' }) });
    await expect(thread.locator('[aria-busy="true"]')).toBeVisible();
    await expect(thread.getByLabel(/просмотр/)).toHaveCount(0);

    release();
    await expect(thread.getByLabel(/просмотр/)).toBeVisible();
    await expect(thread.locator('[aria-busy="true"]')).toHaveCount(0);
  });

  test('records a view and shows a sign-in prompt on a published work', async ({
    page,
  }) => {
    await page.goto('/kasia-voit');
    const workLink = page
      .locator('main a[href^="/kasia-voit/"]:not([href*="/p/"])')
      .first();
    await expect(workLink).toBeVisible();
    await workLink.click();

    await expect(page.getByLabel(/просмотр/)).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Войдите, чтобы поставить лайк' }),
    ).toBeVisible();
  });

  test('lets a signed-in visitor like a work and follow the author', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('artist2@nechto.test');
    await page.getByLabel('Пароль').fill('password123');
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();

    await page.goto('/kasia-voit');
    await expect(
      page.getByRole('button', { name: 'Подписаться' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Подписаться' }).click();
    await expect(
      page.getByRole('button', { name: 'Отписаться' }),
    ).toBeVisible();
    await page.goto('/community?tab=following');
    await expect(page.locator('main a[href="/kasia-voit"]')).toBeVisible();

    await page.goto('/kasia-voit');
    const workLink = page
      .locator('main a[href^="/kasia-voit/"]:not([href*="/p/"])')
      .first();
    await expect(workLink).toBeVisible();
    await workLink.click();
    await page.getByRole('button', { name: 'Лайк' }).click();
    await expect(
      page.getByRole('button', { name: 'Убрать лайк' }),
    ).toBeVisible();
  });
});
