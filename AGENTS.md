# AGENTS.md

Nechto is a Node >=22.18 monorepo: Next.js web, NestJS/Prisma API,
`api-contract`, `api-client`, PostgreSQL, and Docker Compose.

## Work in phases

1. Implement the smallest complete change.
2. During implementation, use changed-file diagnostics and targeted tests.
3. Before commit, add required behavior tests and run checks for touched layers.
4. Full suites belong to CI/merge readiness, not every edit.

Do not launch broad audits/subagents, run full Playwright, or wait for CI unless
the request/risk requires it. Auth, destructive actions, migrations, storage,
security boundaries, and shared contracts require broader verification.

## Commands

```bash
npm run format:check   # before commit
npm run lint           # before commit
npm run typecheck      # TypeScript/shared changes
npm run build:packages # contract/client changes or after branch switch
npm run test:packages  # api-client
npm run test:api       # API unit
npm run test:api:e2e   # API HTTP
npx playwright test <specs> --workers=1 # affected web flows
npm test               # merge-ready/full local gate only
```

Follow scoped rules in `.cursor/rules/`. Keep diffs focused, comments English,
UI copy ru+en, web/API interaction through shared packages, and commits
uncreated until explicitly requested.
