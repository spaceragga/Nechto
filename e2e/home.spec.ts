import { expect, test } from '@playwright/test';

test.describe('home page locales', () => {
  test('renders Russian copy by default', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Nechto/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Творческие люди Беларуси',
    );
  });

  test('renders English copy on /en', async ({ page }) => {
    await page.goto('/en');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Creative people of Belarus',
    );
  });

  test('switches language from the locale select', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('combobox').selectOption('en');
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Creative people of Belarus',
    );

    await page.getByRole('combobox').selectOption('ru');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Творческие люди Беларуси',
    );
  });
});
