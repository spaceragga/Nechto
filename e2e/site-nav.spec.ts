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

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Данные аккаунта' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Данные аккаунта',
    );

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Восстановление пароля' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Восстановление пароля',
    );

    await page.goto('/u/demo');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('demo');
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

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Account data' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Account data',
    );

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Reset password' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Reset password',
    );

    await page.goto('/en/u/demo');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('demo');
  });
});
