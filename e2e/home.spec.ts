import { expect, test } from '@playwright/test';

test.describe('home page locales', () => {
  test('renders Russian copy by default', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Nechto/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Привет, мир!',
    );
  });

  test('renders English copy on /en', async ({ page }) => {
    await page.goto('/en');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Hello world!',
    );
  });

  test('switches language from the locale select', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('combobox').selectOption('en');
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Hello world!',
    );

    await page.getByRole('combobox').selectOption('ru');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Привет, мир!',
    );
  });
});
