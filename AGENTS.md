# AGENTS.md

Instructions for AI agents working in this repository.

## Project

**Nechto** — internet art-space platform (Belarus-first). Current state: monorepo scaffold with Hello World web/API and Docker Compose.

## Commands

```bash
docker compose up --build   # web :3000, api :3001, postgres :5432
npm run typecheck           # both workspaces
npm run dev:web             # Next.js locally
npm run dev:api             # NestJS locally
```

## Rules

Project Cursor rules live in `.cursor/rules/`:

1. **english-comments** — all code comments must be English
2. **nechto-project** — stack, layout, agent conventions

Follow those rules on every change. Prefer small, verified diffs over broad rewrites.
