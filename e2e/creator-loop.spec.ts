import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { markEmailVerified } from './helpers/mark-email-verified';

const avatarFixture = path.join(__dirname, 'fixtures', 'avatar.png');
const imageBuffer = readFileSync(avatarFixture);

async function completeProfile(page: Page, slug: string) {
  await page.getByRole('link', { name: 'Профиль' }).click();
  await expect(page.getByRole('heading', { name: 'Профиль' })).toBeVisible();
  await page.getByLabel('Имя').fill('Каталожный автор');
  await page.getByLabel('О себе').fill('Минск');
  await page.getByLabel('Адрес профиля').fill(slug);
  await page.getByLabel('Фотография').check();
  await page.getByLabel('Сайт').fill('https://example.com');
  await page
    .getByLabel('Я принимаю правила платформы и политику конфиденциальности')
    .check();
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await page.getByLabel('Фото профиля').setInputFiles(avatarFixture);
  await expect(page.getByTestId('profile-avatar')).toBeVisible({
    timeout: 15_000,
  });
}

async function publishWorks(page: Page, count: number) {
  for (let index = 0; index < count; index += 1) {
    const created = await page.request.post('/api/works', {
      multipart: {
        title: `Работа ${index + 1}`,
        altText: `Описание работы ${index + 1}`,
        file: {
          name: `work-${index + 1}.png`,
          mimeType: 'image/png',
          buffer: imageBuffer,
        },
      },
    });
    expect(created.ok()).toBeTruthy();
    const work = (await created.json()) as { id: string };
    const published = await page.request.patch(`/api/works/${work.id}`, {
      data: { status: 'PUBLISHED' },
    });
    expect(published.ok()).toBeTruthy();
  }
}

test.describe('creator publish loop', () => {
  test('publishes five works, appears in catalog, and accepts a report', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const email = `loop-${Date.now()}@nechto.test`;
    const slug = `loop-${Date.now()}`;

    await page.goto('/register');
    await expect(
      page.getByRole('heading', { name: 'Регистрация' }),
    ).toBeVisible();
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill('password123');
    const registration = page.waitForResponse(
      (response) => new URL(response.url()).pathname === '/api/auth/register',
    );
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    expect((await registration).ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: 'Профиль' })).toBeVisible();

    await completeProfile(page, slug);
    await markEmailVerified(email);
    await publishWorks(page, 5);
    await page.reload();

    await page.getByRole('button', { name: 'Опубликовать профиль' }).click();
    await expect(page.getByText('Профиль опубликован')).toBeVisible();
    await page
      .getByRole('link', { name: 'Открыть публичную страницу' })
      .click();

    await expect(page).toHaveURL(new RegExp(`/u/${slug}$`));
    await expect(
      page.getByRole('heading', { name: 'Каталожный автор' }),
    ).toBeVisible();
    await expect(page.getByText(email)).toHaveCount(0);
    await expect(page.getByText('Работа 1')).toBeVisible();
    await expect(page.getByText('Работа 5')).toBeVisible();

    await page.getByRole('button', { name: 'Пожаловаться' }).click();
    await page.getByRole('button', { name: 'Отправить жалобу' }).click();
    await expect(page.getByText('Жалоба отправлена')).toBeVisible();

    await page.goto('/creators');
    await expect(page.locator(`a[href$="/u/${slug}"]`)).toBeVisible();

    await page.goto(`/en/u/${slug}`);
    await expect(
      page.getByRole('heading', { name: 'Каталожный автор' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Report' })).toBeVisible();
  });
});
