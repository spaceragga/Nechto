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
    await expect(page.getByRole('link', { name: 'Профиль' })).toBeVisible();

    await page.getByRole('link', { name: 'Профиль' }).click();
    await expect(page.getByRole('heading', { name: 'Профиль' })).toBeVisible();

    await page.getByLabel('Имя').fill('Тестовый художник');
    await page.getByLabel('О себе').fill('Минск, фото');
    await page.getByLabel('Адрес профиля').fill(`artist-${Date.now()}`);
    await page.getByLabel('Фотография').check();
    await page.getByLabel('Сайт').fill('https://example.com');
    await page
      .getByLabel('Я принимаю правила платформы и политику конфиденциальности')
      .check();
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

    const works = page.getByRole('heading', { name: 'Работы' }).locator('..');
    await works.getByPlaceholder('Название').fill('Тестовая работа');
    await works
      .getByPlaceholder('Описание изображения')
      .fill('Абстрактная композиция');
    await works.locator('input[name="file"]').setInputFiles(avatarFixture);
    await works.getByRole('button', { name: 'Добавить работу' }).click();
    await expect(works.getByText('Тестовая работа')).toBeVisible();
    await works
      .getByRole('button', { name: 'Опубликовать', exact: true })
      .click();
    await expect(works.getByRole('button', { name: 'Скрыть' })).toBeVisible();
  });

  test('loads the English profile editor after sign-in', async ({ page }) => {
    const email = `profile-en-${Date.now()}@nechto.test`;

    await page.goto('/en/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(page.getByLabel('Display name')).toBeVisible();
  });
});
