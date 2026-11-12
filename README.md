# Nechto

**Дом Независимого Творца** / House of the Independent Creator.

A public art house for independent authors in Belarus. Not a feed and not a marketplace. A person publishes a page, hangs works, gathers them into series, writes for the journal, and can open a studio. Visitors look slowly: one still, a caption, a pause. They can follow an author, leave a comment, like, and report. Curators pair works into dialogues. Moderators and admins handle reports and the house, and those roles are separate from each other.

Russian is the default language (`/`). English is at `/en`.

## What is in the house

- Public profiles with a portrait, directions, works, series, and journal.
- A work page that shows the whole photograph, with likes and views under the comment rule. Profile tiles keep the marks on the image. View counts on a profile grid are visible only to the owner.
- Comments open from a button. The author of a comment can delete it, as can the owner of that work, series, or article, plus a moderator or an admin.
- Follows, notifications, and search.
- Studio pages, a journal, collections, and curator dialogues.
- Staff desks: curation, moderation, and admin. A seeded author can hold more than one of these.
- Register and login with a JWT httpOnly cookie. Password reset mail is JSON locally and SMTP in production.
- Uploads go through `StorageService` onto local disk. The web app never writes files itself.

The web app does not call Nest directly from the browser. It uses `@nechto/api-client`, and the request and response types live in `@nechto/api-contract`.

## Stack

- Node.js **>= 22.18** (`.nvmrc` is `22.18.0`)
- `apps/web` — Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + next-intl + Zod env
- `apps/api` — NestJS 11 + Prisma + Zod env
- `packages/api-contract` and `packages/api-client`
- PostgreSQL 16 and Docker Compose

Browser calls go to same-origin `/api`. Next rewrites that to Nest. Server components use `API_INTERNAL_URL` (`http://api:3001` inside Compose, `http://localhost:3001` on the host).

After `git pull` or any edit under `packages/`, run `npm run build:packages`. `dist/` is gitignored, and the Compose bind mounts read it from the host.

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

On Windows, Docker Desktop bind mounts do not emit file events. Compose turns on polling: webpack for the web app, `tsc --watch` for the API. The web container runs `next dev --webpack` so Tailwind's PostCSS config is picked up. Host edits reload without recreating the containers.

```bash
docker compose up db -d
npm run db:migrate    # prisma migrate dev (local)
npm run db:deploy     # prisma migrate deploy
npm run db:generate   # prisma generate
npm run db:seed       # dev artists, then likes, views, comments, follows, notifications
npm run db:seed:social
```

`db:seed` is the one command for a full local house. `db:seed:social` clears and rebuilds only the social graph. Seed password for every artist: `password123`. Do not run either against production.

Password recovery uses `MAIL_TRANSPORT=json` locally. For real delivery set `MAIL_TRANSPORT=smtp` plus `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and optionally `SMTP_USER` / `SMTP_PASSWORD`. Production requires SMTP.

## Local (without Docker apps)

```bash
npm install
docker compose up db -d
npm run db:migrate
npm run dev:api
npm run dev:web
```

## Tests and checks

```bash
npm run test:packages # Jest (api-client)
npm run test:api      # Jest unit (Nest)
npm run test:api:e2e  # Jest + Supertest
npm run test:e2e      # Playwright (starts web unless already running)
npm test              # all of the above

npm run typecheck
npm run lint
npm run format        # write
npm run format:check  # CI
```

CI jobs: `quality` (format + lint + typecheck + package tests), then `api-test` and `web-e2e` in parallel. The aggregator job is `ci`.

On Windows, do not run repo-wide `npm run format:check`. Prettier only the files you touched. `package-lock.json` is regenerated with Node 22.18 in Docker, not with the host npm.

## Building it with an AI agent

This repo is written by a person and a Cursor agent together. The person sets the product, looks at the house, and says what is wrong. The agent reads the code, makes the smallest change that matches, and checks the result in the browser. It does not invent a parallel design and it does not commit unless asked.

How that is kept honest:

- `AGENTS.md` and `.cursor/rules/` are the standing brief: stack, boundaries, when tests run, when a commit or a PR is allowed.
- UI copy is Russian and English. Code comments stay English.
- The web app only talks to the API through `@nechto/api-client` / `@nechto/api-contract`.
- Auth stays in an httpOnly cookie. Secrets and plaintext passwords are not logged.
- A commit is a Conventional Commit in English, and only after an explicit ask. A pull request is a separate ask. Nothing lands on `main` from the agent.
- Before a PR, the same checks CI runs (`quality`, `api-test`, `web-e2e`) are run locally.

The agent is a pair at the keyboard, not an author of the house. Taste, scope, and the decision to ship stay with the person.
