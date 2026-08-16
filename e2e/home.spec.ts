import { expect, test, type Locator } from '@playwright/test';

async function countUnclippedLinks(rail: Locator) {
  return rail.evaluate((root) => {
    const clip = root.getBoundingClientRect();
    return [...root.querySelectorAll('a')].filter((el) => {
      const box = el.getBoundingClientRect();
      const overlap =
        Math.min(box.right, clip.right) - Math.max(box.left, clip.left);
      return overlap > 8;
    }).length;
  });
}

test.describe('home page locales', () => {
  test('renders Russian copy by default', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Nechto/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Дом Независимого Творца',
    );
  });

  test('renders English copy on /en', async ({ page }) => {
    await page.goto('/en');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'House of the Independent Creator',
    );
  });

  test('shows the Now strip with three authors and their latest works in Russian', async ({
    page,
  }) => {
    await page.goto('/');

    const now = page.getByRole('complementary', { name: 'Подборка авторов' });
    await expect(
      now.getByRole('link', { name: 'Кася Фотография' }),
    ).toBeVisible();
    await expect(
      now.getByRole('link', { name: 'Анна Интерьер' }),
    ).toBeVisible();
    await expect(now.getByRole('link', { name: 'Юлия Мода' })).toBeVisible();
    await expect(now.getByRole('link')).toHaveCount(18);
    await expect(
      now.getByRole('link', { name: 'Портрет у окна' }),
    ).toBeVisible();
    await expect(now.getByRole('link', { name: 'Кухня' })).toBeVisible();
    await expect(now.getByRole('link', { name: 'Ателье' })).toBeVisible();
  });

  test('hovering a Now author outlines the whole row', async ({ page }) => {
    await page.goto('/');

    const now = page.getByRole('complementary', { name: 'Подборка авторов' });
    const author = now.getByRole('link', { name: 'Кася Фотография' });
    const outline = author.locator('..').locator('[data-now-row-outline]');

    await expect(outline).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    await author.hover();
    await expect(outline).toHaveCSS(
      'border-top-color',
      'rgba(255, 255, 255, 0.5)',
    );
  });

  test('explore and direction chips use the shared hover outline', async ({
    page,
  }) => {
    await page.goto('/');

    const exploreChip = page
      .getByRole('navigation', { name: 'Разделы' })
      .getByRole('link', { name: 'Авторы' });
    await exploreChip.hover();
    await expect(exploreChip).toHaveCSS(
      'border-top-color',
      'rgba(255, 255, 255, 0.5)',
    );

    const directionChip = page
      .getByRole('navigation', { name: 'Фильтр по направлению' })
      .getByRole('link', { name: 'Фотография' });
    await directionChip.hover();
    await expect(directionChip).toHaveCSS(
      'border-top-color',
      'rgba(255, 255, 255, 0.5)',
    );
  });

  test('billboard caption sits below the still, not on it', async ({
    page,
  }) => {
    await page.goto('/');

    const billboard = page.getByRole('link', { name: /Ночной рынок/ }).first();
    const frame = billboard.locator('[data-work-frame]');
    const kicker = billboard.getByText('Работа недели');
    const frameBox = await frame.boundingBox();
    const kickerBox = await kicker.boundingBox();

    expect(frameBox).toBeTruthy();
    expect(kickerBox).toBeTruthy();
    expect(kickerBox!.y).toBeGreaterThanOrEqual(
      frameBox!.y + frameBox!.height - 1,
    );
  });

  test('shows a work feature and a creator feature in Russian', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByText('Работа недели')).toBeVisible();
    await expect(page.getByText('Автор недели')).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Ночной рынок/ }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Автор недели/ }),
    ).toBeVisible();
  });

  test('shows a work feature and a creator feature in English', async ({
    page,
  }) => {
    await page.goto('/en');

    await expect(page.getByText('Work of the week')).toBeVisible();
    await expect(page.getByText('Creator of the week')).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Night market/ }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Creator of the week/ }),
    ).toBeVisible();
  });

  test('shows journal, selection, and fresh spots in Russian', async ({
    page,
  }) => {
    await page.goto('/');

    const spots = page.getByRole('region', {
      name: 'Журнал, подборки и новые работы',
    });
    await expect(spots.getByRole('link', { name: /Окна Каси/ })).toBeVisible();
    await expect(spots.getByRole('link', { name: /Дворы/ })).toBeVisible();
    await expect(spots.getByRole('link', { name: 'Все новые' })).toBeVisible();
    await expect(spots.getByRole('link', { name: /Шов/ })).toBeVisible();
  });

  test('shows journal, selection, and fresh spots in English', async ({
    page,
  }) => {
    await page.goto('/en');

    const spots = page.getByRole('region', {
      name: 'Journal, selections, and new work',
    });
    await expect(spots.getByRole('link', { name: /windows/i })).toBeVisible();
    await expect(spots.getByRole('link', { name: /Yards/ })).toBeVisible();
    await expect(spots.getByRole('link', { name: 'All new' })).toBeVisible();
    await expect(spots.getByRole('link', { name: /Seam/ })).toBeVisible();
  });

  test('work frames have no rounding', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#works [data-work-frame]').first()).toHaveCSS(
      'border-radius',
      '0px',
    );
  });

  test('shows the Now strip with three authors and their latest works in English', async ({
    page,
  }) => {
    await page.goto('/en');

    const now = page.getByRole('complementary', { name: 'Author selection' });
    await expect(
      now.getByRole('link', { name: 'Kasia Photography' }),
    ).toBeVisible();
    await expect(
      now.getByRole('link', { name: 'Anna Interior' }),
    ).toBeVisible();
    await expect(
      now.getByRole('link', { name: 'Yulia Fashion' }),
    ).toBeVisible();
    await expect(now.getByRole('link')).toHaveCount(18);
    await expect(
      now.getByRole('link', { name: 'Portrait by the window' }),
    ).toBeVisible();
    await expect(now.getByRole('link', { name: 'Kitchen' })).toBeVisible();
    await expect(now.getByRole('link', { name: 'Atelier' })).toBeVisible();
  });

  test('explore chips open creators and stubs in Russian', async ({ page }) => {
    await page.goto('/');

    const explore = page.getByRole('navigation', { name: 'Разделы' });
    await expect(explore.getByRole('link', { name: 'Авторы' })).toBeVisible();
    await expect(
      explore.getByRole('link', { name: 'Топ работ' }),
    ).toBeVisible();
    await expect(explore.getByRole('link', { name: 'Новые' })).toBeVisible();
    await expect(explore.getByRole('link', { name: 'Подборки' })).toBeVisible();
    await expect(explore.getByRole('link', { name: 'Журнал' })).toBeVisible();
    await expect(
      explore.getByRole('link', { name: 'Сообщество' }),
    ).toBeVisible();

    await explore.getByRole('link', { name: 'Авторы' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Авторы');

    await page.goto('/');
    const sections = page.getByRole('navigation', { name: 'Разделы' });
    await sections.getByRole('link', { name: 'Топ работ' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Топ работ',
    );

    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Разделы' })
      .getByRole('link', { name: 'Новые' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Новые');

    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Разделы' })
      .getByRole('link', { name: 'Подборки' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Подборки',
    );
    await expect(page.getByRole('link', { name: /Дворы/ })).toBeVisible();

    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Разделы' })
      .getByRole('link', { name: 'Журнал' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Журнал');
    await expect(page.getByRole('link', { name: /Окна Каси/ })).toBeVisible();

    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Разделы' })
      .getByRole('link', { name: 'Сообщество' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Сообщество',
    );
  });

  test('explore chips open creators and stubs in English', async ({ page }) => {
    await page.goto('/en');

    const explore = page.getByRole('navigation', { name: 'Sections' });
    await expect(explore.getByRole('link', { name: 'Creators' })).toBeVisible();
    await expect(
      explore.getByRole('link', { name: 'Top works' }),
    ).toBeVisible();
    await expect(explore.getByRole('link', { name: 'New' })).toBeVisible();
    await expect(
      explore.getByRole('link', { name: 'Selections' }),
    ).toBeVisible();
    await expect(explore.getByRole('link', { name: 'Journal' })).toBeVisible();
    await expect(
      explore.getByRole('link', { name: 'Community' }),
    ).toBeVisible();

    await explore.getByRole('link', { name: 'Creators' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Creators',
    );

    await page.goto('/en');
    const sections = page.getByRole('navigation', { name: 'Sections' });
    await sections.getByRole('link', { name: 'Top works' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Top works',
    );

    await page.goto('/en');
    await page
      .getByRole('navigation', { name: 'Sections' })
      .getByRole('link', { name: 'New' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('New');

    await page.goto('/en');
    await page
      .getByRole('navigation', { name: 'Sections' })
      .getByRole('link', { name: 'Selections' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Selections',
    );
    await expect(page.getByRole('link', { name: /Yards/ })).toBeVisible();

    await page.goto('/en');
    await page
      .getByRole('navigation', { name: 'Sections' })
      .getByRole('link', { name: 'Journal' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Journal');
    await expect(page.getByRole('link', { name: /windows/i })).toBeVisible();

    await page.goto('/en');
    await page
      .getByRole('navigation', { name: 'Sections' })
      .getByRole('link', { name: 'Community' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Community',
    );
  });

  test('home rails show more cards as the viewport widens', async ({
    page,
  }) => {
    const worksRail = page.locator('#works .fluid-rail');

    await page.setViewportSize({ width: 420, height: 900 });
    await page.goto('/');
    const narrowVisible = await countUnclippedLinks(worksRail);

    await page.setViewportSize({ width: 1400, height: 900 });
    const wideVisible = await countUnclippedLinks(worksRail);

    expect(narrowVisible).toBeGreaterThan(0);
    expect(wideVisible).toBeGreaterThan(narrowVisible);
    expect(wideVisible).toBeLessThan(8);
  });

  test('switches language from the locale select', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('banner').getByRole('combobox').selectOption('en');
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'House of the Independent Creator',
    );

    await page.getByRole('banner').getByRole('combobox').selectOption('ru');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Дом Независимого Творца',
    );
  });
});
