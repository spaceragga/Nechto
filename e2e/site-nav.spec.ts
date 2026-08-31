import { expect, test } from '@playwright/test';

test.describe('site navigation', () => {
  test('opens remaining pages from the Russian shell', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Дом Независимого Творца',
    );

    await page.goto('/creators');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Авторы');

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Правила' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Правила платформы',
    );

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Конфиденциальность' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Политика конфиденциальности',
    );

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Сообщество' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Правила сообщества',
    );

    const footer = page.getByRole('contentinfo');
    await expect(
      footer.getByRole('link', { name: 'Данные аккаунта' }),
    ).toHaveCount(0);
    await expect(footer.getByRole('link', { name: 'Профиль' })).toHaveCount(0);

    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Аккаунт' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Данные аккаунта',
    );

    const account = page.getByRole('main');
    await account.getByRole('link', { name: 'Восстановление пароля' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Восстановление пароля',
    );

    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Аккаунт' })
      .click();
    await page
      .getByRole('main')
      .getByRole('link', { name: 'Сменить пароль' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Сменить пароль',
    );

    await page.goto('/u/demo');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('demo');
    await expect(page.locator('[data-public-profile-photo]')).toBeVisible();
  });

  test('opens remaining pages from the English shell', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'House of the Independent Creator',
    );

    await page.goto('/en/creators');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Creators',
    );

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Terms' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Platform terms',
    );

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Privacy' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Privacy notice',
    );

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Community' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Community guidelines',
    );

    const footer = page.getByRole('contentinfo');
    await expect(
      footer.getByRole('link', { name: 'Account data' }),
    ).toHaveCount(0);
    await expect(footer.getByRole('link', { name: 'Profile' })).toHaveCount(0);

    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Account' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Account data',
    );

    await page
      .getByRole('main')
      .getByRole('link', { name: 'Reset password' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Reset password',
    );

    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Account' })
      .click();
    await page
      .getByRole('main')
      .getByRole('link', { name: 'Change password' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Change password',
    );

    await page.goto('/en/u/demo');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('demo');
    await expect(page.locator('[data-public-profile-photo]')).toBeVisible();
  });
});
