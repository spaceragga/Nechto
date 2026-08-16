# Launch runbook

Manual testing after merge uses the **dev** compose on your machine. Production compose is for a VPS (hoster.by or similar) with Docker + a domain.

## Manual test (local)

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
docker compose up --build
```

Open http://localhost:3000 (Russian) and http://localhost:3000/en.

SMTP is optional in this mode: register/forgot-password succeed, mail is skipped and warned in API logs. Publish still needs a verified email — set it in Postgres:

```bash
docker compose exec db psql -U nechto -d nechto -c "UPDATE \"User\" SET \"emailVerifiedAt\" = NOW() WHERE email = 'you@example.com';"
```

Promote an admin the same way (`role = 'ADMIN'`). There is no admin UI; use curl against `/api/admin/moderation/reports` with the admin cookie.

### Logs

There is no log UI in the browser. Nest writes JSON lines to stdout/stderr.

```bash
docker compose logs -f api          # API JSON logs
docker compose logs -f web          # Next
docker compose logs -f --tail=100   # everything
```

Pretty-print API JSON (jq):

```bash
docker compose logs -f api | jq -R 'fromjson? // .'
```

In the browser use DevTools → Network for HTTP only (`/api/...`). That is not the application logger.

On a VPS with prod compose, same commands with `-f deploy/docker-compose.prod.yml --env-file deploy/.env.prod`.

## Required human approvals (public launch)

- Legal counsel approves terms, privacy, community guidelines (pages are stubs).
- Someone owns `support@nechto.by` and has `User.role = ADMIN`.
- DNS `nechto.by` → the VPS. Caddy terminates TLS.
- Real SMTP. Production API **will not start** without `SMTP_*`.
- Media lives on the API disk volume (`uploads_data`). Back it up with Postgres.

## Preflight (production)

1. Copy `deploy/.env.prod.example` to `deploy/.env.prod` and fill secrets (`JWT_SECRET` ≥ 32 chars).
2. Do not publish Postgres or Nest ports. Only 80/443 via Caddy.
3. `docker compose --env-file deploy/.env.prod -f deploy/docker-compose.prod.yml config`
4. Build: `docker compose --env-file deploy/.env.prod -f deploy/docker-compose.prod.yml build`

## Deploy

1. Backup Postgres (see `backup-restore.md`).
2. `docker compose --env-file deploy/.env.prod -f deploy/docker-compose.prod.yml up -d`
3. `migrate` container must exit 0.
4. Check `/health` via the site (`https://nechto.by/api/health`) and the smoke list: register, login, profile, 5 works, publish, catalog, report, password reset (needs SMTP).
5. Cookies: `HttpOnly`, `Secure`, `SameSite=Lax`, path `/`.

If hoster.by already terminates TLS, skip the `caddy` service and reverse-proxy to `web:3000`. Keep `/api` going through Next (same-origin cookies).

## Assign the first admin

```bash
docker compose --env-file deploy/.env.prod -f deploy/docker-compose.prod.yml exec db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'support@nechto.by';"
```

```bash
curl -sS -H "Cookie: nechto_access_token=<token>" https://nechto.by/api/admin/moderation/reports

curl -sS -X PATCH https://nechto.by/api/admin/moderation/reports/<reportId> \
  -H "Cookie: nechto_access_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"RESOLVED","suspendProfile":true,"note":"copyright"}'
```

Dismiss without hiding: `"suspendProfile": false`, `"status": "DISMISSED"`.

## Rollback

Redeploy previous images. Do not rewrite Prisma migration history. Restore a pre-deploy dump into a new database if a migration cannot stay.
