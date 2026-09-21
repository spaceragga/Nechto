import { expect, test } from '@playwright/test';
import path from 'node:path';
import { nextProfilePane } from './profile-panes';

const avatarFixture = path.join(__dirname, 'fixtures', 'avatar.png');

test.describe('projects', () => {
  test('assembles a series from uploaded works', async ({ page }) => {
    test.setTimeout(90_000);
    const email = `series-${Date.now()}@nechto.test`;

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill('password123');
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Профиль' }),
    ).toBeVisible();

    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Профиль' })
      .click();
    await expect(page.getByTestId('profile-editor')).toHaveAttribute(
      'data-hydrated',
      'true',
    );
    await page.getByLabel('Имя').fill('Серия Тест');
    await page.getByLabel('Адрес профиля').fill(`series-${Date.now()}`);
    await page.getByRole('checkbox', { name: /принимаю правила/ }).check();
    await page.getByLabel('Фото профиля').setInputFiles(avatarFixture);
    await page.getByRole('button', { name: 'Сохранить' }).click();
    await expect(page.getByTestId('profile-avatar')).toBeVisible({
      timeout: 15_000,
    });

    await nextProfilePane(page);
    await expect(page.getByRole('heading', { name: 'Работы' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Проекты' })).toHaveCount(0);

    const addWork = page.getByRole('form', { name: 'Добавить работу' });
    for (let index = 1; index <= 2; index += 1) {
      await addWork.getByLabel('Название').fill(`Кадр ${index}`);
      await addWork.getByLabel('Описание').fill(`Заметка ${index}.`);
      await addWork.getByLabel('Файл работы').setInputFiles(avatarFixture);
      await addWork.getByRole('button', { name: 'Добавить работу' }).click();
      await expect(
        page.getByRole('article', { name: `Кадр ${index}` }),
      ).toBeVisible({ timeout: 15_000 });
    }

    await nextProfilePane(page);
    await expect(page.getByRole('heading', { name: 'Проекты' })).toBeVisible();

    const addProject = page.getByRole('form', { name: 'Создать проект' });
    await addProject.getByLabel('Название серии').fill('Дворы');
    await addProject.getByRole('button', { name: 'Создать проект' }).click();
    const series = page.getByRole('article', { name: 'Дворы' });
    await expect(series).toBeVisible();

    await series.getByRole('button', { name: 'Кадр 1' }).click();
    await series.getByRole('button', { name: 'Скрыть название' }).click();
    await expect(
      series.getByRole('button', { name: 'Показать название' }),
    ).toBeVisible();
    await series.getByRole('button', { name: 'Вставить текст' }).click();
    await series.getByLabel('Текст между кадрами').fill('После дождя.');
    await series.getByRole('button', { name: 'Кадр 2' }).click();
    await series.getByRole('button', { name: 'Сохранить серию' }).click();
    await expect(series.getByText('Серия сохранена')).toBeVisible();
  });
});
