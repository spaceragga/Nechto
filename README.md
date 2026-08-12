# Nechto

Art space platform scaffold.

## Stack

- `apps/web` — Next.js 15 + Tailwind CSS 4 + next-intl (ru / en, TypeScript) + Zod env
- `apps/api` — NestJS 11 + Prisma + Zod env (TypeScript)
- PostgreSQL 16
- Docker Compose (`prisma migrate deploy` on API boot)
- Shared strict TS: `tsconfig.base.json`

Locales: **Russian default** (`/`), English (`/en`).

Auth: register/login via JWT httpOnly cookie (`/login`, `/register`, `POST /auth/*`).

Profiles: `/profile` edit + avatar upload. Files go through `StorageService` (local disk now; S3 later).

## Database

```bash
docker compose up db -d
npm run db:migrate    # prisma migrate dev (local)
npm run db:deploy     # prisma migrate deploy
npm run db:generate   # prisma generate
```

## Tests

```bash
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
```

CI jobs: `quality` (format + lint + typecheck) → then parallel `api-test` and `web-e2e`.

## Run (Docker)

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:3001
- API health: http://localhost:3001/health
- Postgres: `localhost:5432` (`nechto` / `nechto` / db `nechto`)

## Local (without Docker apps)

```bash
npm install
docker compose up db -d
npm run db:migrate
npm run dev:api
npm run dev:web
```
