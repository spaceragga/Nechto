import { expect, test } from '@playwright/test';
import { navigate } from './follow-link';

test.describe('explore feeds', () => {
  test('opens new, top works, and community in Russian', async ({ page }) => {
    await navigate(page, '/new');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Новые');
    await expect(page.locator('main')).toContainText(
      /Свежие публикации|Пока нет опубликованных/,
    );

    await navigate(page, '/top-works');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Топ работ',
    );
    await expect(page.locator('main')).toContainText(
      /Последняя работа|Пока нет опубликованных/,
    );

    await navigate(page, '/community');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Сообщество',
    );
    await expect(page.locator('main')).toContainText(/Стена дома|Пока тихо/);

    await navigate(page, '/works');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Работы');
    await expect(
      page.getByRole('navigation', { name: 'Фильтр по направлению' }),
    ).toBeVisible();

    await navigate(page, '/projects');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Проекты');
    await expect(
      page.getByRole('navigation', { name: 'Фильтр по направлению' }),
    ).toBeVisible();

    await navigate(page, '/collections');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Подборки',
    );
    await expect(page.getByRole('heading', { name: 'Серии' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'По направлению' }),
    ).toBeVisible();
  });

  test('opens new, top works, and community in English', async ({ page }) => {
    await navigate(page, '/en/new');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('New');
    await expect(page.locator('main')).toContainText(
      /Fresh publications|No published works/,
    );

    await navigate(page, '/en/top-works');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Top works',
    );
    await expect(page.locator('main')).toContainText(
      /The latest work|No published works/,
    );

    await navigate(page, '/en/community');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Community',
    );
    await expect(page.locator('main')).toContainText(
      /The house wall|Quiet for now/,
    );

    await navigate(page, '/en/works');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Works');
    await expect(
      page.getByRole('navigation', { name: 'Filter by direction' }),
    ).toBeVisible();

    await navigate(page, '/en/projects');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Projects',
    );
    await expect(
      page.getByRole('navigation', { name: 'Filter by direction' }),
    ).toBeVisible();

    await navigate(page, '/en/collections');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Selections',
    );
    await expect(page.getByRole('heading', { name: 'Series' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'By direction' }),
    ).toBeVisible();
  });

  test('work tiles on new go to the work page when the feed is live', async ({
    page,
  }) => {
    await navigate(page, '/new');
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
