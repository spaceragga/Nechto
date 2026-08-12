# Nechto

Art space platform scaffold.

## Stack

- `apps/web` — Next.js 15 + Tailwind CSS 4 (TypeScript)
- `apps/api` — NestJS 11 (TypeScript)
- PostgreSQL 16
- Docker Compose
- Shared strict TS: `tsconfig.base.json`

## Typecheck

```bash
npm run typecheck
```

## Run (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:3001
- API health: http://localhost:3001/health
- Postgres: `localhost:5432` (`nechto` / `nechto` / db `nechto`)

## Local (without Docker apps)

```bash
npm install
npm run dev:api
npm run dev:web
```

Postgres still via Compose:

```bash
docker compose up db -d
```
