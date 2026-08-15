import { expect, test } from '@playwright/test';

test.describe('auth flow', () => {
  test('registers a new user from the UI', async ({ page }) => {
    const email = `artist-${Date.now()}@nechto.test`;
    const password = 'password123';

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();
  });

  test('logs in an existing user from the English UI', async ({ page }) => {
    const email = `artist-en-${Date.now()}@nechto.test`;
    const password = 'password123';

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();
    await page.getByRole('button', { name: 'Выйти' }).click();
    await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible();

    await page.goto('/en/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  });

  test('shows localized error when email is already registered', async ({
    page,
  }) => {
    const email = `dup-${Date.now()}@nechto.test`;
    const password = 'password123';

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();
    await page.getByRole('button', { name: 'Выйти' }).click();

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();

    await expect(
      page.getByRole('alert').getByText('Этот email уже зарегистрирован'),
    ).toBeVisible();

    await page.goto('/en/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(
      page.getByRole('alert').getByText('This email is already registered'),
    ).toBeVisible();
  });
});
