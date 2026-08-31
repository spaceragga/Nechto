import { expect, test } from '@playwright/test';

test.describe('creators page', () => {
  test('cards pair a portrait with four works in Russian', async ({ page }) => {
    await page.goto('/creators');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Авторы');

    const cards = page.locator('[data-creator-card]');
    const count = await cards.count();
    if (count === 0) {
      await expect(page.getByText('Пока здесь никого нет')).toBeVisible();
      return;
    }

    const card = cards.first();
    await expect(card.locator('[data-creator-portrait]')).toHaveCount(1);
    await expect(card.locator('[data-creator-work]')).toHaveCount(4);
    const portrait = card.locator('[data-creator-portrait] [data-work-frame]');
    const src = await portrait.getAttribute('data-still-src');
    expect(src ?? '').not.toMatch(/\/works\//);
    expect(src ?? '').toMatch(/portrait|avatars/);
  });

  test('cards pair a portrait with four works in English', async ({ page }) => {
    await page.goto('/en/creators');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Creators',
    );

    const cards = page.locator('[data-creator-card]');
    const count = await cards.count();
    if (count === 0) {
      await expect(page.getByText('No creators here yet')).toBeVisible();
      return;
    }

    const card = cards.first();
    await expect(card.locator('[data-creator-portrait]')).toHaveCount(1);
    await expect(card.locator('[data-creator-work]')).toHaveCount(4);
  });
});
