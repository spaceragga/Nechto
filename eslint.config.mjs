import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslint from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const repoRoot = dirname(fileURLToPath(import.meta.url));

/**
 * Scope Next.js flat configs to apps/web so Nest/API code is not linted as React.
 * @param {import('eslint').Linter.Config[]} configs
 * @param {string} directory
 */
function scopeConfigs(configs, directory) {
  return configs.map((config) => {
    const scoped = { ...config };

    if (scoped.files) {
      scoped.files = scoped.files.map((pattern) => `${directory}/${pattern}`);
    } else if (!scoped.ignores) {
      scoped.files = [`${directory}/**/*.{js,jsx,mjs,cjs,ts,tsx}`];
    }

    if (scoped.ignores) {
      scoped.ignores = scoped.ignores.map(
        (pattern) => `${directory}/${pattern}`,
      );
    }

    return scoped;
  });
}

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    '**/coverage/**',
    '**/test-results/**',
    '**/playwright-report/**',
    '**/blob-report/**',
    'apps/api/prisma/migrations/**',
  ]),
  {
    files: [
      'apps/api/**/*.{ts,js}',
      'packages/**/*.{ts,js}',
      'e2e/**/*.ts',
      'playwright.config.ts',
      '*.config.{js,mjs,cjs,ts}',
    ],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  ...scopeConfigs(nextVitals, 'apps/web'),
  {
    files: ['apps/web/**/*.{js,jsx,ts,tsx}'],
    settings: {
      next: {
        rootDir: join(repoRoot, 'apps/web'),
      },
    },
  },
  prettier,
]);
