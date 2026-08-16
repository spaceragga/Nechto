import { expect, test } from '@playwright/test';
import path from 'node:path';

const avatarFixture = path.join(__dirname, 'fixtures', 'avatar.png');

test.describe('profile photo', () => {
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

    await page.getByLabel('Имя').fill('Тестовый художник');
    await page.getByLabel('О себе').fill('Минск, фото');
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByLabel('Имя')).toHaveValue('Тестовый художник');

    await page.getByLabel('Фото профиля').setInputFiles(avatarFixture);
    await expect(page.getByTestId('profile-avatar')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('profile-avatar')).toHaveAttribute(
      'src',
      /\/uploads\/avatars\//,
    );
  });
});
