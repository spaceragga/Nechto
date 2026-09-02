import { expect, test } from '@playwright/test';
import { openProfileVisibilityPane } from './profile-panes';

test.describe('account lifecycle', () => {
  test('submits password recovery forms in Russian and English', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.goto('/forgot-password?from=login');
    await page.getByRole('button', { name: 'Назад' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/forgot-password?from=login');
    await page.getByLabel('Email').fill(`missing-${Date.now()}@nechto.test`);
    await page.getByRole('button', { name: 'Отправить ссылку' }).click();
    await expect(page.getByRole('status')).toHaveText(
      'Если аккаунт существует, ссылка отправлена на email.',
    );

    await page.goto('/en/login');
    await page.goto('/en/forgot-password?from=login');
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await page.getByLabel('Email').fill(`missing-en-${Date.now()}@nechto.test`);
    await page.getByRole('button', { name: 'Send reset link' }).click();
    await expect(page.getByRole('status')).toHaveText(
      'If the account exists, a reset link has been sent.',
    );
  });

  test('submits reset forms in Russian and English', async ({ page }) => {
    await page.route('**/api/auth/reset-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });
    const token = 'a'.repeat(43);

    await page.goto(`/reset-password?token=${token}`);
    await expect(page.getByRole('button', { name: 'Назад' })).toBeVisible();
    await page.getByLabel('Новый пароль', { exact: true }).fill('new-password');
    await page.getByLabel('Повторите новый пароль').fill('new-password');
    await page.getByRole('button', { name: 'Сохранить пароль' }).click();
    await expect(page.getByRole('status')).toHaveText(
      'Пароль обновлён. Теперь можно войти.',
    );

    await page.goto(`/en/reset-password?token=${token}`);
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await page.getByLabel('New password', { exact: true }).fill('new-password');
    await page.getByLabel('Confirm new password').fill('new-password');
    await page.getByRole('button', { name: 'Save password' }).click();
    await expect(page.getByRole('status')).toHaveText(
      'Password updated. You can now sign in.',
    );
  });

  test('leaves profile password recovery for home on logout', async ({
    page,
  }) => {
    await page.goto('/register');
    await page
      .getByLabel('Email')
      .fill(`recovery-logout-${Date.now()}@nechto.test`);
    await page.getByLabel('Пароль').fill('password123');
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Профиль' })
      .click();
    await expect(page.getByTestId('profile-editor')).toHaveAttribute(
      'data-hydrated',
      'true',
    );
    await openProfileVisibilityPane(page);
    await page.getByRole('link', { name: 'Восстановление пароля' }).click();
    await expect(page).toHaveURL(/\/forgot-password\?from=profile$/);

    await expect(page.locator('[data-auth-hydrated="true"]')).toBeVisible();
    await page.getByRole('button', { name: 'Выйти' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('changes the password and logs in with the new one', async ({
    page,
  }) => {
    const email = `password-${Date.now()}@nechto.test`;

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill('password123');
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Профиль' }),
    ).toBeVisible();
    const accountPaneResponse = await page.request.get('/profile?pane=account');
    expect(await accountPaneResponse.text()).not.toContain('Загружаем профиль');
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Профиль' })
      .click();
    await expect(page.getByTestId('profile-editor')).toHaveAttribute(
      'data-hydrated',
      'true',
    );
    await openProfileVisibilityPane(page);
    await expect(
      page.getByRole('link', { name: 'Восстановление пароля' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Сменить пароль' }).click();
    await page.getByLabel('Текущий пароль').fill('password123');
    await page
      .getByLabel('Новый пароль', { exact: true })
      .fill('new-password-1');
    await page.getByLabel('Повторите новый пароль').fill('new-password-1');
    await page.getByRole('button', { name: 'Изменить пароль' }).click();
    await expect(page.getByRole('status')).toHaveText('Пароль изменён');
    await page
      .getByRole('link', {
        name: 'Назад к витрине и управлению аккаунтом',
      })
      .click();
    await expect(page).toHaveURL(/\/profile\?pane=account$/);
    await expect(page.getByTestId('profile-editor')).toHaveAttribute(
      'data-profile-pane',
      '0',
    );

    await expect(page.locator('[data-auth-hydrated="true"]')).toBeVisible();
    await page.getByRole('button', { name: 'Выйти' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Войти' }),
    ).toBeVisible();

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill('new-password-1');
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Профиль' }),
    ).toBeVisible();
  });

  test('permanently deletes the account with the current password', async ({
    page,
  }) => {
    const email = `delete-${Date.now()}@nechto.test`;
    const password = 'password123';

    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Профиль' })
      .click();
    await expect(page.getByTestId('profile-editor')).toHaveAttribute(
      'data-hydrated',
      'true',
    );
    await openProfileVisibilityPane(page);

    await page.getByRole('button', { name: 'Удалить аккаунт' }).click();
    await page.getByLabel('Текущий пароль').fill(password);
    await page.getByRole('button', { name: 'Удалить аккаунт' }).click();
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Войти' }),
    ).toBeVisible();

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Пароль').fill(password);
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(
      page
        .getByRole('alert')
        .getByText('Неверный email или пароль', { exact: true }),
    ).toBeVisible();
  });
});
