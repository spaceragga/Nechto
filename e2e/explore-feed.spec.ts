import { expect, test } from '@playwright/test';

test.describe('explore feeds', () => {
  test('opens new, top works, and community in Russian', async ({ page }) => {
    await page.goto('/new');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Новые');
    await expect(page.locator('main')).toContainText(
      /Свежие публикации|Пока нет опубликованных/,
    );

    await page.goto('/top-works');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Топ работ',
    );
    await expect(page.locator('main')).toContainText(
      /Последняя работа|Пока нет опубликованных/,
    );

    await page.goto('/community');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Сообщество',
    );
    await expect(page.locator('main')).toContainText(/Стена дома|Пока тихо/);
  });

  test('opens new, top works, and community in English', async ({ page }) => {
    await page.goto('/en/new');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('New');
    await expect(page.locator('main')).toContainText(
      /Fresh publications|No published works/,
    );

    await page.goto('/en/top-works');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Top works',
    );
    await expect(page.locator('main')).toContainText(
      /The latest work|No published works/,
    );

    await page.goto('/en/community');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Community',
    );
    await expect(page.locator('main')).toContainText(
      /The house wall|Quiet for now/,
    );
  });

  test('work tiles on new go to the work page when the feed is live', async ({
    page,
  }) => {
    await page.goto('/new');
    const tile = page
      .locator('main a')
      .filter({ has: page.locator('[data-work-frame]') })
      .first();
    if ((await tile.count()) === 0) {
      test.skip();
      return;
    }
    const href = await tile.getAttribute('href');
    expect(href).toMatch(/^\/(?:en\/)?[^/]+\/[^/]+$/);
    await tile.click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('main [data-work-frame]').first()).toBeVisible();
  });
});
