import { expect, test } from '@playwright/test';
import { followLink, navigate } from './follow-link';

test.describe('site navigation', () => {
  test('opens remaining pages from the Russian shell', async ({ page }) => {
    test.setTimeout(60_000);
    await navigate(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Дом Независимого Творца',
    );
    const brand = page
      .getByRole('banner')
      .getByRole('link', { name: 'Nechto' });
    await expect(brand.locator('svg')).toBeVisible();
    expect((await brand.locator('svg').boundingBox())?.height).toBe(40);

    await navigate(page, '/creators');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Авторы');

    await followLink(
      page,
      page.getByRole('contentinfo').getByRole('link', { name: 'Правила' }),
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Правила платформы',
    );

    await followLink(
      page,
      page
        .getByRole('contentinfo')
        .getByRole('link', { name: 'Конфиденциальность' }),
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Политика конфиденциальности',
    );

    await followLink(
      page,
      page.getByRole('contentinfo').getByRole('link', { name: 'Сообщество' }),
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Правила сообщества',
    );

    const footer = page.getByRole('contentinfo');
    await expect(
      footer.getByRole('link', { name: 'Данные аккаунта' }),
    ).toHaveCount(0);
    await expect(footer.getByRole('link', { name: 'Профиль' })).toHaveCount(0);

    const banner = page.getByRole('banner');
    await expect(banner.getByRole('link', { name: 'Аккаунт' })).toHaveCount(0);
    await expect(banner.getByRole('combobox')).toHaveCount(0);
    await expect(footer.getByRole('combobox')).toBeVisible();
    await expect(
      banner.getByRole('link', { name: 'Зарегистрироваться' }),
    ).toHaveCount(0);

    const login = banner.getByRole('link', { name: 'Войти' });
    await login.hover();
    await expect(page.getByRole('tooltip', { name: 'Войти' })).toBeVisible();
    await followLink(page, login);
    const forgotPassword = page.getByRole('link', {
      name: 'Забыли пароль?',
    });
    await expect(forgotPassword).toHaveAttribute(
      'href',
      '/forgot-password?from=login',
    );
    await navigate(page, '/forgot-password?from=login');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Восстановление пароля',
    );

    await navigate(page, '/change-password');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Дом Независимого Творца',
    );

    await navigate(page, '/demo');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('demo');
    await expect(page.locator('[data-public-profile-photo]')).toBeVisible();
  });

  test('opens remaining pages from the English shell', async ({ page }) => {
    test.setTimeout(60_000);
    await navigate(page, '/en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'House of the Independent Creator',
    );
    const brand = page
      .getByRole('banner')
      .getByRole('link', { name: 'Nechto' });
    await expect(brand.locator('svg')).toBeVisible();
    expect((await brand.locator('svg').boundingBox())?.height).toBe(40);

    await navigate(page, '/en/creators');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Creators',
    );

    await followLink(
      page,
      page.getByRole('contentinfo').getByRole('link', { name: 'Terms' }),
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Platform terms',
    );

    await followLink(
      page,
      page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }),
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Privacy notice',
    );

    await followLink(
      page,
      page.getByRole('contentinfo').getByRole('link', { name: 'Community' }),
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Community guidelines',
    );

    const footer = page.getByRole('contentinfo');
    await expect(
      footer.getByRole('link', { name: 'Account data' }),
    ).toHaveCount(0);
    await expect(footer.getByRole('link', { name: 'Profile' })).toHaveCount(0);

    const banner = page.getByRole('banner');
    await expect(banner.getByRole('link', { name: 'Account' })).toHaveCount(0);
    await expect(banner.getByRole('combobox')).toHaveCount(0);
    await expect(footer.getByRole('combobox')).toBeVisible();
    await expect(banner.getByRole('link', { name: 'Sign up' })).toHaveCount(0);

    const login = banner.getByRole('link', { name: 'Log in' });
    await login.hover();
    await expect(page.getByRole('tooltip', { name: 'Log in' })).toBeVisible();
    await followLink(page, login);
    const forgotPassword = page.getByRole('link', {
      name: 'Forgot password?',
    });
    await expect(forgotPassword).toHaveAttribute(
      'href',
      '/en/forgot-password?from=login',
    );
    await navigate(page, '/en/forgot-password?from=login');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Reset password',
    );

    await navigate(page, '/en/change-password');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'House of the Independent Creator',
    );

    await navigate(page, '/en/demo');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('demo');
    await expect(page.locator('[data-public-profile-photo]')).toBeVisible();
  });
});
