import { expect, test } from '@playwright/test';

test.describe('public bilingual surfaces', () => {
  test('shows legal policy surfaces in both locales', async ({ page }) => {
    await page.goto('/privacy');
    await expect(
      page.getByRole('heading', { name: 'Политика конфиденциальности' }),
    ).toBeVisible();

    await page.goto('/en/privacy');
    await expect(
      page.getByRole('heading', { name: 'Privacy notice' }),
    ).toBeVisible();

    await page.goto('/terms');
    await expect(
      page.getByRole('heading', { name: 'Правила платформы' }),
    ).toBeVisible();

    await page.goto('/en/community-guidelines');
    await expect(
      page.getByRole('heading', { name: 'Community guidelines' }),
    ).toBeVisible();
  });

  test('shows localized recovery and not-found pages', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(
      page.getByRole('heading', { name: 'Восстановление пароля' }),
    ).toBeVisible();
    await page.getByLabel('Email').fill('missing@nechto.test');
    await page.getByRole('button', { name: 'Отправить ссылку' }).click();
    await expect(
      page.getByText('Если аккаунт существует, ссылка отправлена на email.'),
    ).toBeVisible();

    await page.goto('/en/forgot-password');
    await expect(
      page.getByRole('heading', { name: 'Reset password' }),
    ).toBeVisible();
    await page.getByLabel('Email').fill('missing@nechto.test');
    await page.getByRole('button', { name: 'Send reset link' }).click();
    await expect(
      page.getByText('If the account exists, a reset link has been sent.'),
    ).toBeVisible();

    await page.goto('/u/no-such-creator');
    await expect(
      page.getByRole('heading', { name: 'Страница не найдена' }),
    ).toBeVisible();

    await page.goto('/en/u/no-such-creator');
    await expect(
      page.getByRole('heading', { name: 'Page not found' }),
    ).toBeVisible();

    await page.goto('/reset-password');
    await expect(
      page.getByText('В ссылке нет токена. Запросите новый.'),
    ).toBeVisible();

    await page.goto('/en/reset-password');
    await expect(
      page.getByText('This link is missing a token. Request a new one.'),
    ).toBeVisible();
  });
});
