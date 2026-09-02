# Nechto

Internet art-space for the Belarus market. Public name: **Дом Независимого Творца** / House of the Independent Creator.

Monorepo MVP: auth, profiles/avatars, bilingual site shell, shared API contracts.

## Requirements

- Node.js **>= 22.18** (`.nvmrc` is `22.18.0`; CI and Docker use Node 22)

## Stack

- `apps/web` — Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + next-intl (ru / en, TypeScript) + Zod env
- `apps/api` — NestJS 11 + Prisma + Zod env (TypeScript)
- `packages/api-contract` — shared Zod schemas + response types
- `packages/api-client` — typed browser/server fetch client
- PostgreSQL 16
- Docker Compose (`prisma migrate deploy` on API boot)
- Shared strict TS: `tsconfig.base.json`

Locales: **Russian default** (`/`), English (`/en`).

Auth: register/login via JWT httpOnly cookie (`/login`, `/register`, `POST /auth/*`). Browser calls use same-origin `/api` (Next rewrite → Nest). RSC uses `API_INTERNAL_URL` (`http://api:3001` in Compose).

Profiles: `/profile` edit + avatar upload. Files go through `StorageService` on local disk (hoster.by).

Shared contracts: import schemas/types from `@nechto/api-contract`; web talks to API via `@nechto/api-client`. After `git pull` or package edits, run `npm run build:packages` (`dist/` is gitignored).

## Database

```bash
docker compose up db -d
npm run db:migrate    # prisma migrate dev (local)
npm run db:deploy     # prisma migrate deploy
npm run db:generate   # prisma generate
```

## Tests

```bash
npm run test:packages # Jest (api-client)
npm run test:api      # Jest unit (Nest)
npm run test:api:e2e  # Jest + Supertest
npm run test:e2e      # Playwright (starts web unless already running)
npm test              # all
```

## Typecheck / lint / format

```bash
npm run typecheck
npm run lint
npm run format        # write
npm run format:check  # CI
npm run build:packages
```

CI jobs: `quality` (format + lint + typecheck + package tests) → then parallel `api-test` and `web-e2e`. Aggregator job: `ci`.

## Run (Docker)

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:3001
- Health: `/health` (process + DB), `/live` (liveness), `/ready` (DB)
- Postgres: `localhost:5432` (`nechto` / `nechto` / db `nechto`)

Password recovery uses `MAIL_TRANSPORT=json` for local development. For real
delivery, set `MAIL_TRANSPORT=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and
optionally the `SMTP_USER` / `SMTP_PASSWORD` pair in `.env`. Production requires
the SMTP transport.

## Local (without Docker apps)

```bash
npm install
docker compose up db -d
npm run db:migrate
npm run dev:api
npm run dev:web
```
