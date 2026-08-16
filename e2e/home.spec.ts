import { expect, test } from '@playwright/test';

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

    const now = page.getByRole('complementary', { name: 'Сейчас' });
    await expect(
      now.getByRole('link', { name: 'Кася Фотография' }),
    ).toBeVisible();
    await expect(
      now.getByRole('link', { name: 'Анна Интерьер' }),
    ).toBeVisible();
    await expect(now.getByRole('link', { name: 'Юлия Мода' })).toBeVisible();
    await expect(now.getByRole('link')).toHaveCount(12);
    await expect(
      now.getByRole('link', { name: 'Портрет у окна' }),
    ).toBeVisible();
    await expect(now.getByRole('link', { name: 'Кухня' })).toBeVisible();
    await expect(now.getByRole('link', { name: 'Ателье' })).toBeVisible();
  });

  test('shows the Now strip with three authors and their latest works in English', async ({
    page,
  }) => {
    await page.goto('/en');

    const now = page.getByRole('complementary', { name: 'Now' });
    await expect(
      now.getByRole('link', { name: 'Kasia Photography' }),
    ).toBeVisible();
    await expect(
      now.getByRole('link', { name: 'Anna Interior' }),
    ).toBeVisible();
    await expect(
      now.getByRole('link', { name: 'Yulia Fashion' }),
    ).toBeVisible();
    await expect(now.getByRole('link')).toHaveCount(12);
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

    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Разделы' })
      .getByRole('link', { name: 'Журнал' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Журнал');

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

    await page.goto('/en');
    await page
      .getByRole('navigation', { name: 'Sections' })
      .getByRole('link', { name: 'Journal' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Journal');

    await page.goto('/en');
    await page
      .getByRole('navigation', { name: 'Sections' })
      .getByRole('link', { name: 'Community' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Community',
    );
  });

  test('switches language from the locale select', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('combobox').selectOption('en');
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'House of the Independent Creator',
    );

    await page.getByRole('combobox').selectOption('ru');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Дом Независимого Творца',
    );
  });
});
