import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ru', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'as-needed',
  // Keep Russian as the stable default for the Belarus-first product.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
