import { expect, test, type Page } from '@playwright/test';

async function logoutFromHeader(page: Page) {
  await expect(page.locator('[data-auth-hydrated="true"]')).toBeVisible();
  await page.getByRole('button', { name: /^(Выйти|Log out)$/ }).click();
}

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
    const profile = page
      .getByRole('banner')
      .getByRole('link', { name: 'Профиль' });
    await profile.hover();
    await expect(
      page.getByRole('tooltip', { name: `Вы вошли как ${email}` }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();
  });

  test('keeps the current public page after logout', async ({ page }) => {
    await page.goto('/register');
    await page
      .getByLabel('Email')
      .fill(`logout-location-${Date.now()}@nechto.test`);
    await page.getByLabel('Пароль').fill('password123');
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();

    await page.goto('/terms');
    await logoutFromHeader(page);
    await expect(page).toHaveURL(/\/terms$/);
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Войти' }),
    ).toBeVisible();
  });

  test('logs in an existing user from the English UI', async ({ page }) => {
    const email = `artist-en-${Date.now()}@nechto.test`;
    const password = 'password123';

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();
    await logoutFromHeader(page);
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Войти' }),
    ).toBeVisible();

    await page.goto('/en/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/en\/?$/);
    const profile = page
      .getByRole('banner')
      .getByRole('link', { name: 'Profile' });
    await profile.hover();
    await expect(
      page.getByRole('tooltip', { name: `Signed in as ${email}` }),
    ).toBeVisible();
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
    await logoutFromHeader(page);

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
    await logoutFromHeader(page);

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
