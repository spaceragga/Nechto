# AGENTS.md

Instructions for AI agents working in this repository.

## Project

**Nechto** — internet art-space platform (Belarus-first). Current state: monorepo scaffold with Hello World web/API and Docker Compose.

## Commands

```bash
docker compose up --build   # web :3000, api :3001, postgres :5432 (runs migrations)
npm run typecheck           # build packages + both apps
npm run build:packages      # @nechto/api-contract + api-client
npm run lint                # ESLint (root flat config)
npm run format              # Prettier write
npm run format:check        # Prettier check (CI)
npm run test:packages       # Jest for shared api-client
npm run test:api            # Jest unit (API)
npm run test:api:e2e        # Jest HTTP e2e (API)
npm run test:e2e            # Playwright UI
npm test                    # packages + api + playwright
# CI: quality → api-test ∥ web-e2e
npm run db:migrate          # Prisma migrate dev
npm run db:deploy           # Prisma migrate deploy
npm run dev:web             # Next.js locally
npm run dev:api             # NestJS locally
```

## Rules

Project Cursor rules live in `.cursor/rules/`:

1. **english-comments** — all code comments must be English
2. **i18n-bilingual** — all UI copy in Russian (primary) + English via next-intl
3. **conventional-commits** — English Conventional Commits (`feat`/`fix`/`docs`/…)
4. **testing** — Jest (API) + Playwright (UI); new behavior needs tests
5. **nechto-project** — stack, layout, agent conventions

Follow those rules on every change. Prefer small, verified diffs over broad rewrites.
