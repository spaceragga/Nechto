import { expect, test } from '@playwright/test';
import { openProfileVisibilityPane } from './profile-panes';

test.describe('account lifecycle', () => {
  test('submits password recovery forms in Russian and English', async ({
    page,
  }) => {
    await page.goto('/forgot-password');
    await page.getByLabel('Email').fill(`missing-${Date.now()}@nechto.test`);
    await page.getByRole('button', { name: 'Отправить ссылку' }).click();
    await expect(page.getByRole('status')).toHaveText(
      'Если аккаунт существует, ссылка отправлена на email.',
    );

    await page.goto('/en/forgot-password');
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
    await page.getByLabel('Новый пароль', { exact: true }).fill('new-password');
    await page.getByLabel('Повторите новый пароль').fill('new-password');
    await page.getByRole('button', { name: 'Сохранить пароль' }).click();
    await expect(page.getByRole('status')).toHaveText(
      'Пароль обновлён. Теперь можно войти.',
    );

    await page.goto(`/en/reset-password?token=${token}`);
    await page.getByLabel('New password', { exact: true }).fill('new-password');
    await page.getByLabel('Confirm new password').fill('new-password');
    await page.getByRole('button', { name: 'Save password' }).click();
    await expect(page.getByRole('status')).toHaveText(
      'Password updated. You can now sign in.',
    );
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
    await page.goto('/change-password');
    await page.getByLabel('Текущий пароль').fill('password123');
    await page
      .getByLabel('Новый пароль', { exact: true })
      .fill('new-password-1');
    await page.getByLabel('Повторите новый пароль').fill('new-password-1');
    await page.getByRole('button', { name: 'Изменить пароль' }).click();
    await expect(page.getByRole('status')).toHaveText('Пароль изменён');

    await expect(page.locator('[data-auth-hydrated="true"]')).toBeVisible();
    await page.getByRole('button', { name: 'Выйти' }).click();
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
