import { expect, test } from '@playwright/test';
import { navigate } from './follow-link';

async function register(page: import('@playwright/test').Page, email: string) {
  await navigate(page, '/register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Пароль').fill('password123');
  await page.getByRole('button', { name: 'Создать аккаунт' }).click();
  await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();
}

test.describe('staff access', () => {
  test('sends anonymous visitors to login and forbids ordinary authors', async ({
    page,
  }) => {
    await navigate(page, '/admin');
    await expect(page).toHaveURL(/\/login\/?$/);

    await register(page, `staff-web-${Date.now()}@nechto.test`);
    const banner = page.getByRole('banner');
    await expect(banner.getByRole('link', { name: 'Админ' })).toHaveCount(0);
    await expect(banner.getByRole('link', { name: 'Куратор' })).toHaveCount(0);
    await expect(banner.getByRole('link', { name: 'Модерация' })).toHaveCount(
      0,
    );

    await navigate(page, '/admin');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Пользователи',
    );
    await expect(page.getByText('Недостаточно прав')).toBeVisible();
  });

  test('shows the admin desk to artist1 after seed', async ({ page }) => {
    await navigate(page, '/login');
    await page.getByLabel('Email').fill('artist1@nechto.test');
    await page.getByLabel('Пароль').fill('password123');
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();

    const banner = page.getByRole('banner');
    await expect(banner.getByRole('link', { name: 'Админ' })).toBeVisible();
    await banner.getByRole('link', { name: 'Админ' }).click();
    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Пользователи',
    );
    await expect(page.getByText('artist1@nechto.test')).toBeVisible();

    await navigate(page, '/moderation');
    await expect(page.getByText('Недостаточно прав')).toBeVisible();
  });
});
