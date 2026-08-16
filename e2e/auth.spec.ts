import { expect, test } from '@playwright/test';

test.describe('auth flow', () => {
  test('registers a new user from the UI', async ({ page }) => {
    const email = `artist-${Date.now()}@nechto.test`;
    const password = 'password123';

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    const registration = page.waitForResponse(
      (response) => new URL(response.url()).pathname === '/api/auth/register',
    );
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    const registrationResponse = await registration;

    await expect(page).toHaveURL(/\/$/);
    expect(new URL(registrationResponse.url()).origin).toBe(
      new URL(page.url()).origin,
    );
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
    const duplicateRu = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/auth/register' &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    const duplicateRuResponse = await duplicateRu;
    expect(duplicateRuResponse.status()).toBe(409);
    await expect(duplicateRuResponse.json()).resolves.toMatchObject({
      code: 'EMAIL_TAKEN',
    });

    await expect(
      page.getByRole('alert').getByText('Этот email уже зарегистрирован'),
    ).toBeVisible();

    await page.goto('/en/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    const duplicateEn = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/auth/register' &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Create account' }).click();
    const duplicateEnResponse = await duplicateEn;
    expect(duplicateEnResponse.status()).toBe(409);
    await expect(duplicateEnResponse.json()).resolves.toMatchObject({
      code: 'EMAIL_TAKEN',
    });

    await expect(
      page.getByRole('alert').getByText('This email is already registered'),
    ).toBeVisible();
  });

  test('shows localized error for invalid login credentials', async ({
    page,
  }) => {
    const email = `login-err-${Date.now()}@nechto.test`;
    const password = 'password123';

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();
    await page.getByRole('button', { name: 'Выйти' }).click();

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill('wrong-password');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(
      page.getByRole('alert').getByText('Неверный email или пароль'),
    ).toBeVisible();

    await page.goto('/en/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(
      page.getByRole('alert').getByText('Invalid email or password'),
    ).toBeVisible();
  });
});
