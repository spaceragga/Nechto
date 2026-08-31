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

    try {
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
      await page.getByLabel('Фото профиля').setInputFiles(avatarFixture);
      await page.getByRole('button', { name: 'Сохранить' }).click();
      await expect(page.getByTestId('profile-avatar')).toBeVisible({
        timeout: 15_000,
      });
      await page.getByRole('button', { name: 'Фотография' }).click();

      const add = page.getByRole('form', { name: 'Добавить работу' });
      for (let index = 1; index <= 5; index += 1) {
        await add.getByLabel('Название').fill(`Работа ${index}`);
        await add.getByLabel('Описание').fill(`Заметка ${index}.`);
        await add.getByLabel('Файл работы').setInputFiles(avatarFixture);
        await add.getByRole('button', { name: 'Добавить работу' }).click();
        await expect(
          page.getByRole('article', { name: `Работа ${index}` }),
        ).toBeVisible({
          timeout: 15_000,
        });
      }

      const first = page.getByRole('article', { name: 'Работа 1' });
      await first.getByLabel('Описание').fill('Дождь на асфальте.');
      await first.getByRole('button', { name: 'Сохранить' }).click();
      await expect(
        first.getByRole('button', { name: 'Сохранить' }),
      ).toBeEnabled();

      await page.getByRole('button', { name: 'Опубликовать профиль' }).click();
      await expect(page.getByText('Профиль опубликован')).toBeVisible();

      await page
        .getByRole('link', { name: 'Открыть публичную страницу' })
        .click();
      await expect(
        page.getByRole('heading', { name: 'Кася Тест' }),
      ).toBeVisible();
      const photo = page.locator(
        '[data-public-profile-photo] [data-work-frame]',
      );
      await expect(photo).toBeVisible();
      await expect(photo).toHaveAttribute('data-still-src', /avatars/);
      await expect(page.getByText('Работа 1')).toBeVisible();
      await expect(page.getByText('Работа 5')).toBeVisible();

      await page.getByRole('link', { name: 'Работа 5' }).click();
      await expect(page).toHaveURL(new RegExp(`/u/${slug}/`));
      await expect(
        page.getByRole('heading', { name: 'Работа 5' }),
      ).toBeVisible();
      await expect(page.getByText('Заметка 5.')).toBeVisible();
      await expect(
        page.locator('main [data-work-frame]').first(),
      ).toBeVisible();
      await expect(page.getByText('Ещё у автора')).toBeVisible();

      await page.goto(`/u/${slug}`);
      await page.getByRole('link', { name: 'Работа 1' }).click();
      await expect(page).toHaveURL(new RegExp(`/u/${slug}/[^/?#]+`));
      await expect(page.getByText('Дождь на асфальте.')).toBeVisible();

      await page.getByRole('banner').getByRole('combobox').selectOption('en');
      await expect(page).toHaveURL(new RegExp(`/en/u/${slug}/[^/?#]+`));
      await expect(page.getByText('More from this creator')).toBeVisible();
      await expect(page.getByText('Дождь на асфальте.')).toBeVisible();

      await page.goto('/');
      const rail = page.getByRole('region', { name: 'Авторы' });
      const railCard = rail.locator(`a[href="/u/${slug}"]`);
      await expect(railCard).toBeVisible();
      const railSrc = await railCard
        .locator('[data-work-frame]')
        .getAttribute('data-still-src');
      expect(railSrc ?? '').toMatch(/avatars/);
      expect(railSrc ?? '').not.toMatch(/\/works\//);

      await page.goto('/creators');
      const catalogCard = page.locator(`a[href="/u/${slug}"]`);
      await expect(catalogCard.locator('[data-creator-portrait]')).toHaveCount(
        1,
      );
      await expect(catalogCard.locator('[data-creator-work]')).toHaveCount(4);

      await page.goto('/profile');
      await page.getByRole('button', { name: 'Скрыть' }).click();
      await expect(
        page.getByRole('button', { name: 'Опубликовать профиль' }),
      ).toBeVisible();
    } finally {
      await page.goto('/profile');
      const hide = page.getByRole('button', { name: 'Скрыть' });
      if (await hide.isVisible()) {
        await hide.click();
      }
    }
  });
});
