# AGENTS.md

Nechto: Node >=22.18, Next.js web, NestJS/Prisma API, `api-contract` /
`api-client`, Compose.

Implement the smallest change. Commits only when asked. Tests only when asked
or right before a PR. Before `gh pr create`, run the local gates in
`quality-gate.mdc` so `quality` / `api-test` / `web-e2e` would already pass.
Details: `.cursor/rules/` (`agent-efficiency`, `testing`, `git-pr-workflow`,
`nechto-project`).
