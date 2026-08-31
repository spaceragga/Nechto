import { expect, test, type Locator, type Page } from '@playwright/test';

function publicSlug(href: string) {
  return href.replace(/^\/(?:en\/)?/, '').split('/')[0] ?? '';
}

function scrollY(page: Page) {
  return page.evaluate(() => window.scrollY);
}

function fluidRailHrefs(section: Locator) {
  return section
    .locator('.fluid-rail a')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('href') ?? ''),
    );
}

function billboard(page: Page) {
  return page.locator('[data-home-spot="billboard"]');
}

function journalSpot(page: Page) {
  return page.locator('[data-home-spot="journal"]');
}

function collectionSpot(page: Page) {
  return page.locator('[data-home-spot="collection"]');
}

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

  test('direction chips filter works and authors, not fragments, in Russian', async ({
    page,
  }) => {
    await page.goto('/');
    const filter = page.getByRole('navigation', {
      name: 'Фильтр по направлению',
    });
    await expect(filter.getByRole('link', { name: 'Все' })).toHaveAttribute(
      'href',
      '/',
    );

    await filter.getByRole('link', { name: 'Фотография' }).click();
    await expect(page).toHaveURL(/direction=photography/);
    await expect(filter.getByRole('link', { name: 'Фотография' })).toHaveCSS(
      'background-color',
      'rgb(196, 92, 38)',
    );

    const works = page.locator('#works');
    const authors = page.getByRole('region', { name: 'Авторы' });
    const fragments = page.locator('#fragments');
    await expect(fragments.locator('[data-work-frame]').first()).toBeVisible();

    const workHrefs = await fluidRailHrefs(works);
    if (workHrefs.length === 0) {
      await expect(
        works.getByText('В этом направлении пока нет работ.'),
      ).toBeVisible();
      return;
    }

    const authorSlugs = new Set(
      (await fluidRailHrefs(authors)).map(publicSlug).filter(Boolean),
    );
    for (const href of workHrefs) {
      expect(authorSlugs.has(publicSlug(href))).toBe(true);
    }
  });

  test('direction chips filter works and authors, not fragments, in English', async ({
    page,
  }) => {
    await page.goto('/en');
    const filter = page.getByRole('navigation', {
      name: 'Filter by direction',
    });
    await filter.getByRole('link', { name: 'Photography' }).click();
    await expect(page).toHaveURL(/direction=photography/);

    const works = page.locator('#works');
    const authors = page.getByRole('region', { name: 'Creators' });
    await expect(
      page.locator('#fragments [data-work-frame]').first(),
    ).toBeVisible();

    const workHrefs = await fluidRailHrefs(works);
    if (workHrefs.length === 0) {
      await expect(
        works.getByText('No works in this direction yet.'),
      ).toBeVisible();
      return;
    }

    const authorSlugs = new Set(
      (await fluidRailHrefs(authors)).map(publicSlug).filter(Boolean),
    );
    for (const href of workHrefs) {
      expect(authorSlugs.has(publicSlug(href))).toBe(true);
    }
  });

  test('fragments keep loading without a direction filter', async ({
    page,
  }) => {
    await page.goto('/');
    const fragments = page.locator('#fragments');
    await expect(fragments.locator('[data-work-frame]').first()).toBeVisible();
    const before = await fragments.locator('[data-work-frame]').count();
    const sentinel = fragments.locator('[data-fragments-more]');
    if ((await sentinel.count()) === 0) {
      expect(before).toBeGreaterThan(0);
      return;
    }
    await sentinel.scrollIntoViewIfNeeded();
    await expect
      .poll(async () => fragments.locator('[data-work-frame]').count())
      .toBeGreaterThan(before);
  });

  test('direction chips keep scroll position in Russian', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#works').scrollIntoViewIfNeeded();
    const before = await scrollY(page);
    expect(before).toBeGreaterThan(400);

    await page
      .getByRole('navigation', { name: 'Фильтр по направлению' })
      .getByRole('link', { name: 'Иллюстрация' })
      .click();
    await expect(page).toHaveURL(/direction=illustration/);
    await expect.poll(async () => scrollY(page)).toBeGreaterThan(before - 80);
    const after = await scrollY(page);
    expect(Math.abs(after - before)).toBeLessThan(80);
  });

  test('direction chips keep scroll position in English', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await page.locator('#works').scrollIntoViewIfNeeded();
    const before = await scrollY(page);
    expect(before).toBeGreaterThan(400);

    await page
      .getByRole('navigation', { name: 'Filter by direction' })
      .getByRole('link', { name: 'Illustration' })
      .click();
    await expect(page).toHaveURL(/direction=illustration/);
    await expect.poll(async () => scrollY(page)).toBeGreaterThan(before - 80);
    const after = await scrollY(page);
    expect(Math.abs(after - before)).toBeLessThan(80);
  });

  test('authors rail stays one compact row when eight or more', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto('/');
    const rail = page.locator('#creators .fluid-rail');
    await expect(rail.locator('a').first()).toBeVisible();
    const count = await rail.locator('a').count();
    expect(count).toBeGreaterThanOrEqual(8);

    const first = await rail.locator('[data-work-frame]').first().boundingBox();
    const lastVisible = await rail
      .locator('[data-work-frame]')
      .nth(7)
      .boundingBox();
    expect(first).toBeTruthy();
    expect(lastVisible).toBeTruthy();
    expect(Math.abs((first?.y ?? 0) - (lastVisible?.y ?? 0))).toBeLessThan(8);
    expect(first?.width ?? 0).toBeLessThan(150);
    expect(first?.height ?? 0).toBeLessThan(200);
  });

  test('shows the Now strip with three authors and their latest works in Russian', async ({
    page,
  }) => {
    await page.goto('/');

    const now = page.getByRole('complementary', { name: 'Подборка авторов' });
    await expect(now.locator('[data-now-row-outline]')).toHaveCount(3);
    await expect(now.getByRole('link').first()).toBeVisible();
    expect(await now.getByRole('link').count()).toBeGreaterThanOrEqual(9);
    const author = now.locator('a').first();
    const avatarBox = await author.locator('[data-work-frame]').boundingBox();
    expect(avatarBox).toBeTruthy();
    expect(Math.round(avatarBox!.width)).toBe(60);
    expect(Math.round(avatarBox!.height)).toBe(60);
  });

  test('Now stills fill taller author rows', async ({ page }) => {
    await page.goto('/');

    const now = page.getByRole('complementary', { name: 'Подборка авторов' });
    const frame = now.locator('.fluid-rail [data-work-frame]').first();
    const row = now.locator('[data-now-row-outline]').first();
    const frameBox = await frame.boundingBox();
    const rowBox = await row.boundingBox();

    expect(rowBox).toBeTruthy();
    expect(frameBox).toBeTruthy();
    expect(rowBox!.height).toBeGreaterThanOrEqual(140);
    expect(frameBox!.height).toBeGreaterThanOrEqual(120);
    await expect(now.locator('[data-now-row-outline]')).toHaveCount(3);
    const lastRow = now.locator('[data-now-row-outline]').last();
    const lastBox = await lastRow.boundingBox();
    const nowBox = await now.boundingBox();
    expect(lastBox).toBeTruthy();
    expect(nowBox).toBeTruthy();
    expect(nowBox!.y + nowBox!.height).toBeGreaterThanOrEqual(
      lastBox!.y + lastBox!.height - 1,
    );
  });

  test('hovering a Now author outlines the whole row', async ({ page }) => {
    await page.goto('/');

    const now = page.getByRole('complementary', { name: 'Подборка авторов' });
    const author = now.locator('a').first();
    const outline = author.locator('..').locator('[data-now-row-outline]');

    await expect(outline).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    await author.hover();
    await expect(outline).toHaveCSS(
      'border-top-color',
      'rgba(255, 255, 255, 0.5)',
    );
  });

  test('explore and direction chips use fill, not outline', async ({
    page,
  }) => {
    await page.goto('/');

    const exploreChip = page
      .getByRole('navigation', { name: 'Разделы' })
      .getByRole('link', { name: 'Авторы' });
    await expect(exploreChip).toHaveCSS('border-top-width', '0px');
    await expect(exploreChip).toHaveCSS('border-radius', '0px');
    await exploreChip.hover();
    await expect(exploreChip).toHaveCSS(
      'background-color',
      /rgba\(255,\s*255,\s*255,\s*0\.08\)|oklab\([^)]+\/\s*0\.08\)/,
    );

    const allChip = page
      .getByRole('navigation', { name: 'Фильтр по направлению' })
      .getByRole('link', { name: 'Все' });
    await expect(allChip).toHaveCSS('border-top-width', '0px');
    await expect(allChip).toHaveCSS('background-color', 'rgb(196, 92, 38)');
  });

  test('billboard caption sits below the still, not on it', async ({
    page,
  }) => {
    await page.goto('/');

    const billboardLink = billboard(page);
    const frame = billboardLink.locator('[data-work-frame]');
    const kicker = billboardLink.getByText('Работа недели');
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
    await expect(billboard(page)).toBeVisible();
    await expect(page.getByRole('link', { name: /Автор недели/ })).toHaveCSS(
      'text-align',
      'center',
    );
  });

  test('shows a work feature and a creator feature in English', async ({
    page,
  }) => {
    await page.goto('/en');

    await expect(page.getByText('Work of the week')).toBeVisible();
    await expect(page.getByText('Creator of the week')).toBeVisible();
    await expect(billboard(page)).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Creator of the week/ }),
    ).toHaveCSS('text-align', 'center');
  });

  test('shows journal between the work of the week and the author selection', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const work = page.getByText('Работа недели');
    const journal = journalSpot(page);
    const now = page.getByRole('complementary', { name: 'Подборка авторов' });

    const workBox = await work.boundingBox();
    const journalBox = await journal.boundingBox();
    const nowBox = await now.boundingBox();

    expect(workBox).toBeTruthy();
    expect(journalBox).toBeTruthy();
    expect(nowBox).toBeTruthy();
    expect(journalBox!.x).toBeGreaterThan(workBox!.x);
    expect(journalBox!.x).toBeLessThan(nowBox!.x);
  });

  test('work of the week still is taller than the journal still', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const work = billboard(page);
    const journal = journalSpot(page);
    const workFrame = await work.locator('[data-work-frame]').boundingBox();
    const journalFrame = await journal
      .locator('[data-work-frame]')
      .boundingBox();

    expect(workFrame).toBeTruthy();
    expect(journalFrame).toBeTruthy();
    expect(workFrame!.height).toBeGreaterThan(journalFrame!.height);
  });

  test('shows selection, fresh, looking, dialogue, and studio in Russian', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const spots = page.getByRole('region', {
      name: 'Новые работы, подборки, зритель, диалог и студия',
    });
    await expect(collectionSpot(page)).toBeVisible();
    await expect(spots.getByRole('link', { name: 'Все новые' })).toBeVisible();
    await expect(
      spots.getByRole('link', { name: /Как смотреть/ }),
    ).toBeVisible();
    await expect(
      spots.getByRole('link', { name: /Окно и дверь/ }),
    ).toBeVisible();
    await expect(
      spots.getByRole('link', { name: /Войти в студию/ }),
    ).toBeVisible();
    await expect(
      spots.getByRole('link', { name: /Как смотреть/ }),
    ).toHaveAttribute('href', '/journal');
    await expect(
      spots.getByRole('link', { name: /Войти в студию/ }),
    ).toHaveAttribute('href', /^\/[a-z0-9-]+$/);

    const freshKicker = spots.getByText('Только что');
    const dialogueKicker = spots.getByText('Диалог');
    const lookingKicker = spots.getByText('Зрителю');
    const studioKicker = spots.getByText('Студия', { exact: true });
    const collection = collectionSpot(page);
    const collectionBox = await collection.boundingBox();
    const freshBox = await freshKicker.boundingBox();
    const lookingBox = await lookingKicker.boundingBox();
    const dialogueBox = await dialogueKicker.boundingBox();
    const studioBox = await studioKicker.boundingBox();

    const author = page.getByRole('link', { name: /Автор недели/ });
    const now = page.getByRole('complementary', { name: 'Подборка авторов' });
    const authorBox = await author.boundingBox();
    const nowBox = await now.boundingBox();

    expect(freshBox).toBeTruthy();
    expect(collectionBox).toBeTruthy();
    expect(lookingBox).toBeTruthy();
    expect(dialogueBox).toBeTruthy();
    expect(studioBox).toBeTruthy();
    expect(authorBox).toBeTruthy();
    expect(nowBox).toBeTruthy();
    expect(dialogueBox!.x).toBeLessThan(collectionBox!.x);
    expect(collectionBox!.x).toBeLessThan(lookingBox!.x);
    expect(Math.abs(dialogueBox!.x - authorBox!.x)).toBeLessThan(40);
    expect(dialogueBox!.y).toBeGreaterThan(authorBox!.y);
    expect(Math.abs(studioBox!.x - lookingBox!.x)).toBeLessThan(40);
    expect(studioBox!.y).toBeGreaterThan(lookingBox!.y);
    expect(Math.abs(freshBox!.x - nowBox!.x)).toBeLessThan(40);
    expect(freshBox!.y).toBeGreaterThan(nowBox!.y + nowBox!.height - 8);
    expect(Math.abs(lookingBox!.x - freshBox!.x)).toBeLessThan(40);
    expect(lookingBox!.y).toBeGreaterThan(freshBox!.y);
  });

  test('collection mosaic is staggered under the journal', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const journal = journalSpot(page);
    const collection = collectionSpot(page);
    const now = page.getByRole('complementary', { name: 'Подборка авторов' });
    const fresh = page.getByText('Только что');
    const openCall = page.getByRole('link', { name: /Открытый приём/ });
    const frames = collection.locator('[data-work-frame]');

    await expect(frames).toHaveCount(4);

    const journalBox = await journal.boundingBox();
    const collectionBox = await collection.boundingBox();
    const nowBox = await now.boundingBox();
    const freshBox = await fresh.boundingBox();
    const openCallBox = await openCall.boundingBox();
    const frameBoxes = await frames.evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return { height: box.height, y: box.y };
      }),
    );

    expect(journalBox).toBeTruthy();
    expect(collectionBox).toBeTruthy();
    expect(nowBox).toBeTruthy();
    expect(freshBox).toBeTruthy();
    expect(openCallBox).toBeTruthy();

    const midGap = collectionBox!.y - (journalBox!.y + journalBox!.height);
    const rightGap = freshBox!.y - (nowBox!.y + nowBox!.height);
    expect(Math.abs(midGap - rightGap)).toBeLessThan(24);

    const heights = frameBoxes.map((box) => box.height);
    expect(Math.max(...heights) - Math.min(...heights)).toBeGreaterThan(24);

    const tops = frameBoxes.map((box) => box.y);
    expect(Math.max(...tops) - Math.min(...tops)).toBeGreaterThan(24);

    expect(openCallBox!.y).toBeGreaterThanOrEqual(
      collectionBox!.y + collectionBox!.height + 16,
    );
  });

  test('shows selection, fresh, looking, dialogue, and studio in English', async ({
    page,
  }) => {
    await page.goto('/en');

    const spots = page.getByRole('region', {
      name: 'New work, selections, looking, dialogue, and studio',
    });
    await expect(collectionSpot(page)).toBeVisible();
    await expect(spots.getByRole('link', { name: 'All new' })).toBeVisible();
    await expect(
      spots.getByRole('link', { name: /How to look/ }),
    ).toBeVisible();
    await expect(
      spots.getByRole('link', { name: /Window and door/ }),
    ).toBeVisible();
    await expect(
      spots.getByRole('link', { name: /Enter the studio/ }),
    ).toBeVisible();
    await expect(
      spots.getByRole('link', { name: /How to look/ }),
    ).toHaveAttribute('href', '/en/journal');
    await expect(journalSpot(page)).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Work is welcome/ }),
    ).toHaveAttribute('href', '/en/register');
  });

  test('shows the open call as a full-width band with centered copy', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const openCall = page.getByRole('link', { name: /Открытый приём/ });
    const title = openCall.getByRole('heading', { name: 'Открытый приём' });
    const frame = openCall.locator('[data-work-frame]');

    const openCallBox = await openCall.boundingBox();
    const titleBox = await title.boundingBox();
    const frameBox = await frame.boundingBox();
    const viewport = page.viewportSize();

    expect(openCallBox).toBeTruthy();
    expect(titleBox).toBeTruthy();
    expect(frameBox).toBeTruthy();
    expect(viewport).toBeTruthy();
    expect(openCallBox!.width).toBeGreaterThan(viewport!.width * 0.85);
    expect(frameBox!.width).toBeGreaterThan(viewport!.width * 0.85);
    expect(
      Math.abs(
        titleBox!.x +
          titleBox!.width / 2 -
          (openCallBox!.x + openCallBox!.width / 2),
      ),
    ).toBeLessThan(24);
    await expect(openCall).toHaveAttribute('href', '/register');
  });

  test('shows the hanging spot in Russian', async ({ page }) => {
    await page.goto('/');

    const spots = page.getByRole('region', {
      name: 'Развес',
    });
    await expect(
      spots.getByRole('link', { name: /Сегодня на стене/ }),
    ).toBeVisible();
    await expect(
      spots.getByRole('link', { name: /Сегодня на стене/ }),
    ).toHaveAttribute('href', '/top-works');
    await expect(spots.locator('[data-work-frame]').first()).toBeVisible();
    expect(await spots.locator('[data-work-frame]').count()).toBeGreaterThan(0);
    expect(
      await spots.locator('[data-work-frame]').count(),
    ).toBeLessThanOrEqual(5);
    await expect(
      spots.getByRole('link', { name: /Сегодня на стене/ }),
    ).toHaveCSS('text-align', 'center');
    await expect(spots).toHaveCSS('padding-top', '24px');
    await expect(spots).toHaveCSS('padding-bottom', '24px');
  });

  test('shows the hanging spot in English', async ({ page }) => {
    await page.goto('/en');

    const spots = page.getByRole('region', {
      name: 'Hanging',
    });
    await expect(
      spots.getByRole('link', { name: /On the wall today/ }),
    ).toBeVisible();
    await expect(spots.locator('[data-work-frame]').first()).toBeVisible();
    expect(await spots.locator('[data-work-frame]').count()).toBeGreaterThan(0);
    expect(
      await spots.locator('[data-work-frame]').count(),
    ).toBeLessThanOrEqual(5);
    await expect(
      spots.getByRole('link', { name: /On the wall today/ }),
    ).toHaveCSS('text-align', 'center');
  });

  test('work frames have no rounding', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#works [data-work-frame]').first()).toHaveCSS(
      'border-radius',
      '0px',
    );
  });

  test('demo works load public still URLs into the frame', async ({ page }) => {
    await page.goto('/');

    const frame = page.locator('#works [data-work-frame]').first();
    await expect(frame).toHaveAttribute(
      'data-still-src',
      /\/demo\/[a-z]+\.jpg$|\/uploads\//,
    );
    await expect
      .poll(async () =>
        frame.locator('img').evaluate((image: HTMLImageElement) => {
          return image.naturalWidth;
        }),
      )
      .toBeGreaterThan(0);
  });

  test('shows the Now strip with three authors and their latest works in English', async ({
    page,
  }) => {
    await page.goto('/en');

    const now = page.getByRole('complementary', { name: 'Author selection' });
    await expect(now.locator('[data-now-row-outline]')).toHaveCount(3);
    await expect(now.getByRole('link').first()).toBeVisible();
    expect(await now.getByRole('link').count()).toBeGreaterThanOrEqual(9);
    await expect(
      now.locator('a').first().locator('[data-work-frame]'),
    ).toHaveCount(1);
  });

  test('creators rail shows author portraits, not works, in Russian', async ({
    page,
  }) => {
    await page.goto('/');
    const rail = page.getByRole('region', { name: 'Авторы' });
    const frames = rail.locator('[data-work-frame]');
    await expect(frames.first()).toBeVisible();
    const count = await frames.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      const src = await frames.nth(index).getAttribute('data-still-src');
      expect(src ?? '').not.toMatch(/\/works\//);
      expect(src ?? '').toMatch(/portrait|avatars/);
    }
  });

  test('creators rail shows author portraits, not works, in English', async ({
    page,
  }) => {
    await page.goto('/en');
    const rail = page.getByRole('region', { name: 'Creators' });
    const frames = rail.locator('[data-work-frame]');
    await expect(frames.first()).toBeVisible();
    const count = await frames.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      const src = await frames.nth(index).getAttribute('data-still-src');
      expect(src ?? '').not.toMatch(/\/works\//);
      expect(src ?? '').toMatch(/portrait|avatars/);
    }
  });

  test('explore chips open creators and stubs in Russian', async ({ page }) => {
    test.setTimeout(60_000);
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
      .getByRole('link', { name: 'Новые', exact: true })
      .click();
    await expect(page).toHaveURL(/\/new\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Новые');

    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Разделы' })
      .getByRole('link', { name: 'Подборки' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Подборки',
    );
    await expect(page.locator('main a').first()).toBeVisible();

    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Разделы' })
      .getByRole('link', { name: 'Журнал', exact: true })
      .click();
    await expect(page).toHaveURL(/\/journal\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Журнал');
    await expect(page.locator('main a').first()).toBeVisible();

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
    test.setTimeout(60_000);
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
      .getByRole('link', { name: 'New', exact: true })
      .click();
    await expect(page).toHaveURL(/\/en\/new\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('New');

    await page.goto('/en');
    await page
      .getByRole('navigation', { name: 'Sections' })
      .getByRole('link', { name: 'Selections' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Selections',
    );
    await expect(page.locator('main a').first()).toBeVisible();

    await page.goto('/en');
    await page
      .getByRole('navigation', { name: 'Sections' })
      .getByRole('link', { name: 'Journal', exact: true })
      .click();
    await expect(page).toHaveURL(/\/en\/journal\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Journal');
    await expect(page.locator('main a').first()).toBeVisible();

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
