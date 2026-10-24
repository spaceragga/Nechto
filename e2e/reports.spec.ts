import { expect, test } from '@playwright/test';

test.describe('profile reports', () => {
  test('lets a visitor report a published profile', async ({ page }) => {
    await page.goto('/kasia-voit');
    await expect(
      page.getByRole('heading', { name: 'Кася Войт' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Пожаловаться' }).click();
    await page.getByLabel('Причина').selectOption('spam');
    await page.getByLabel('Подробности').fill('Тестовая жалоба.');
    await page
      .getByLabel('Email для обратной связи')
      .fill('visitor@nechto.test');
    await page.getByRole('button', { name: 'Отправить жалобу' }).click();
    await expect(page.getByRole('status')).toHaveText('Жалоба отправлена');
  });

  test('hides the report control from the profile owner', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('artist1@nechto.test');
    await page.getByLabel('Пароль').fill('password123');
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();

    await page.goto('/kasia-voit');
    await expect(
      page.getByRole('heading', { name: 'Кася Войт' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Пожаловаться' }),
    ).toHaveCount(0);
  });
});
