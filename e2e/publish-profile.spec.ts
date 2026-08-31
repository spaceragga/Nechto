import { expect, test } from '@playwright/test';
import path from 'node:path';

const avatarFixture = path.join(__dirname, 'fixtures', 'avatar.png');

test.describe('publish profile', () => {
  test('uploads works, publishes, and shows them on the public page', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const email = `works-${Date.now()}@nechto.test`;
    const password = 'password123';
    const slug = `artist-${Date.now()}`;

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

    await expect(page.getByRole('heading', { name: 'Работы' })).toBeVisible();
    await expect(page.getByTestId('profile-editor')).toHaveAttribute(
      'data-hydrated',
      'true',
    );
    await page.getByLabel('Имя').fill('Кася Тест');
    await page.getByLabel('Адрес профиля').fill(slug);
    await page.getByRole('checkbox', { name: /принимаю правила/ }).check();
    await page.getByRole('button', { name: 'Фотография' }).click();

    for (let index = 1; index <= 5; index += 1) {
      await page.getByLabel('Название').fill(`Работа ${index}`);
      await page.getByLabel('Файл работы').setInputFiles(avatarFixture);
      await page.getByRole('button', { name: 'Добавить работу' }).click();
      await expect(page.getByText(`Работа ${index}`)).toBeVisible({
        timeout: 15_000,
      });
    }

    await page.getByRole('button', { name: 'Опубликовать профиль' }).click();
    await expect(page.getByText('Профиль опубликован')).toBeVisible();

    await page
      .getByRole('link', { name: 'Открыть публичную страницу' })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Кася Тест' }),
    ).toBeVisible();
    await expect(page.getByText('Работа 1')).toBeVisible();
    await expect(page.getByText('Работа 5')).toBeVisible();

    await page.goto('/profile');
    await page.getByRole('button', { name: 'Скрыть' }).click();
    await expect(
      page.getByRole('button', { name: 'Опубликовать профиль' }),
    ).toBeVisible();
  });
});
