import { expect, test } from '@playwright/test';
import path from 'node:path';

const avatarFixture = path.join(__dirname, 'fixtures', 'avatar.png');

test.describe('profile', () => {
  test('updates profile and uploads an avatar', async ({ page }) => {
    const email = `profile-${Date.now()}@nechto.test`;
    const password = 'password123';

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Профиль' }),
    ).toBeVisible();

    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Профиль' })
      .click();
    await expect(page.getByRole('heading', { name: 'Профиль' })).toBeVisible();
    await expect(page.getByTestId('profile-editor')).toHaveAttribute(
      'data-hydrated',
      'true',
    );

    await page.getByLabel('Имя').fill('Тестовый художник');
    await page.getByLabel('О себе').fill('Минск, фото');
    await page.getByLabel('Фото профиля').setInputFiles(avatarFixture);
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByLabel('Имя')).toHaveValue('Тестовый художник');
    await expect(page.getByRole('status')).toHaveText('Сохранено');
    await expect(page.getByLabel('Фото профиля')).toHaveValue('');
    await expect(page.getByTestId('profile-avatar')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('profile-avatar')).toHaveAttribute(
      'src',
      /\/uploads\/avatars\//,
    );
    await expect
      .poll(async () =>
        page.getByTestId('profile-avatar').evaluate((image) => {
          return (image as { naturalWidth: number }).naturalWidth;
        }),
      )
      .toBeGreaterThan(0);
  });

  test('shows works copy in English', async ({ page }) => {
    const email = `works-en-${Date.now()}@nechto.test`;
    const password = 'password123';

    await page.goto('/en/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Profile' }),
    ).toBeVisible();

    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Profile' })
      .click();

    await expect(page.getByRole('heading', { name: 'Works' })).toBeVisible();
    await expect(page.getByTestId('profile-editor')).toHaveAttribute(
      'data-hydrated',
      'true',
    );
    await expect(
      page.getByText('Complete your profile and publish at least five works.'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Publish profile' }),
    ).toBeDisabled();
  });
});
