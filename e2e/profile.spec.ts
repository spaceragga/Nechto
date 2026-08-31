import { expect, test } from '@playwright/test';
import path from 'node:path';
import { nextProfilePane } from './profile-panes';

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
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Аккаунт' }),
    ).toHaveCount(0);

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
        page
          .getByTestId('profile-avatar')
          .evaluate((image: HTMLImageElement) => {
            return image.naturalWidth;
          }),
      )
      .toBeGreaterThan(0);

    await nextProfilePane(page);
    await expect(page.getByRole('heading', { name: 'Работы' })).toBeVisible();
    await nextProfilePane(page);
    await expect(page.getByRole('heading', { name: 'Витрина' })).toBeVisible();
    await nextProfilePane(page);
    await expect(
      page.getByRole('heading', { name: 'Данные аккаунта' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Сменить пароль' }),
    ).toBeVisible();
    await page
      .getByTestId('profile-editor')
      .getByRole('button', { name: 'Назад' })
      .click();
    await expect(page.getByRole('heading', { name: 'Витрина' })).toBeVisible();
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
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Account' }),
    ).toHaveCount(0);

    const profileLink = page
      .getByRole('banner')
      .getByRole('link', { name: 'Profile' });
    const logout = page
      .getByRole('banner')
      .getByRole('button', { name: 'Log out' });
    await expect(profileLink).toHaveCSS('text-decoration-line', 'none');
    await expect(profileLink).toHaveCSS('opacity', '0.8');
    await expect(profileLink.locator('svg')).toBeVisible();
    await expect(profileLink).toHaveText('');
    await expect(logout.locator('svg')).toBeVisible();
    await expect(logout).toHaveText('');
    await profileLink.hover();
    await expect(profileLink).toHaveCSS('opacity', '1');
    await expect(
      page.getByRole('tooltip', { name: `Signed in as ${email}` }),
    ).toBeVisible();
    await logout.hover();
    await expect(page.getByRole('tooltip', { name: 'Log out' })).toBeVisible();
    const profileBox = await profileLink.boundingBox();
    const logoutBox = await logout.boundingBox();
    expect(profileBox && logoutBox ? profileBox.x < logoutBox.x : false).toBe(
      true,
    );

    await profileLink.click();

    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(page.getByTestId('profile-editor')).toHaveAttribute(
      'data-hydrated',
      'true',
    );
    await expect(page.getByTestId('profile-editor')).toHaveAttribute(
      'data-profile-pane',
      '0',
    );

    const editor = page.getByTestId('profile-editor');
    const next = editor.getByRole('button', { name: 'Next' });
    const prev = editor.getByRole('button', { name: 'Back' });
    await expect(next).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    await next.hover();
    await expect(next).toHaveCSS(
      'border-top-color',
      /rgba\(255,\s*255,\s*255,\s*0\.3\)|oklab\([^)]+\/\s*0\.3\)/,
    );
    await prev.hover();
    await expect(prev).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    const box = await next.boundingBox();
    expect(box?.height).toBe(144);
    const chevron = await next.locator('svg').boundingBox();
    expect(chevron?.height).toBe(108);
    expect(
      chevron && box
        ? Math.abs(chevron.y + chevron.height / 2 - (box.y + box.height / 2))
        : 99,
    ).toBeLessThan(2);
    const viewportHeight = page.viewportSize()?.height ?? 0;
    const midpoint = (box?.y ?? 0) + (box?.height ?? 0) / 2;
    expect(Math.abs(midpoint - viewportHeight / 2)).toBeLessThan(160);

    await nextProfilePane(page);
    await expect(page.getByRole('heading', { name: 'Works' })).toBeVisible();
    await expect(page.getByTestId('profile-editor')).toHaveAttribute(
      'data-profile-pane',
      '1',
    );

    await nextProfilePane(page);
    await expect(page.getByRole('heading', { name: 'Showcase' })).toBeVisible();
    await expect(
      page.getByText('Complete your profile and publish at least five works.'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Publish profile' }),
    ).toBeDisabled();

    await nextProfilePane(page);
    await expect(
      page.getByRole('heading', { name: 'Account data' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Change password' }),
    ).toBeVisible();
    await expect(
      page.getByTestId('profile-editor').getByRole('button', { name: 'Next' }),
    ).toBeDisabled();
  });
});
