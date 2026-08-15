# Public launch runbook

## Required human approvals

- Legal counsel approves the Russian and English terms, privacy notice, cookie use, content rules, takedown flow, and Belarus/EU data-transfer wording.
- A moderator owns `support@nechto.by`, has an `ADMIN` database role, and accepts the moderation response SLA.
- DNS owner points `nechto.by` to the production host and the media hostname to the S3-compatible bucket/CDN.
- Product owner verifies the creator onboarding copy, taxonomy, five-work publication threshold, and analytics events.

## Preflight

1. Copy `deploy/.env.prod.example` to `deploy/.env.prod`; replace every placeholder with a secret from the production secret manager.
2. Confirm ports 80/443 are the only public application ports. PostgreSQL and Nest must remain private.
3. Run `npm ci`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm audit --audit-level=high`.
4. Build both production images:
   `docker compose --env-file deploy/.env.prod -f deploy/docker-compose.prod.yml build`.
5. Test database restore and S3 object access before accepting user uploads.

## Deploy

1. Create an on-demand database backup.
2. Run `docker compose --env-file deploy/.env.prod -f deploy/docker-compose.prod.yml up -d`.
3. Verify the one-shot `migrate` container exited with code 0.
4. Verify `/health`, `/api/health`, `/api/ready`, `/`, `/ru`, `/en`, registration, login, logout, profile editing, five image uploads, publication, discovery, contact click, report submission, password reset, and email verification.
5. Confirm cookies are `HttpOnly`, `Secure`, `SameSite=Lax`, and scoped to `/`.
6. Confirm direct access to PostgreSQL and Nest from the public internet fails.

## Assign the first admin

There is no admin UI. Moderation is an authenticated API:

```bash
# Promote an existing user (run against the private Postgres instance).
psql "$DATABASE_URL" -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'support@nechto.by';"
```

```bash
# List open reports (session cookie from an ADMIN login on nechto.by).
curl -sS -H "Cookie: nechto_access_token=<token>" https://nechto.by/api/admin/moderation/reports

# Resolve and suspend the reported profile (revokes every live session).
curl -sS -X PATCH https://nechto.by/api/admin/moderation/reports/<reportId> \
  -H "Cookie: nechto_access_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"RESOLVED","suspendProfile":true,"note":"copyright"}'
```

Dismiss without hiding the profile by sending `"suspendProfile": false` and `"status": "DISMISSED"`.

## Rollback

Application rollback means deploying the previous immutable image tags. Do not roll back a database migration by editing migration history. If a migration is incompatible, restore the pre-deploy backup into a new database, point the previous application version at it, and retain the failed database for investigation.
