import { expect, test, type Page } from '@playwright/test';

async function navigate(page: Page, path: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      return;
    } catch (error) {
      if (attempt === 1 || !String(error).includes('net::ERR_ABORTED')) {
        throw error;
      }
    }
  }
}

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
    await login.click();
    await page.getByRole('link', { name: 'Забыли пароль?' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Восстановление пароля',
    );

    await navigate(page, '/change-password');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Сменить пароль',
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

    const banner = page.getByRole('banner');
    await expect(banner.getByRole('link', { name: 'Account' })).toHaveCount(0);
    await expect(banner.getByRole('combobox')).toHaveCount(0);
    await expect(footer.getByRole('combobox')).toBeVisible();
    await expect(banner.getByRole('link', { name: 'Sign up' })).toHaveCount(0);

    const login = banner.getByRole('link', { name: 'Log in' });
    await login.hover();
    await expect(page.getByRole('tooltip', { name: 'Log in' })).toBeVisible();
    await login.click();
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Reset password',
    );

    await navigate(page, '/en/change-password');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Change password',
    );

    await navigate(page, '/en/demo');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('demo');
    await expect(page.locator('[data-public-profile-photo]')).toBeVisible();
  });
});
