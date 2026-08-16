# Incident response runbook

## Severity

- **SEV-1:** data exposure, account takeover at scale, destructive data loss, or total outage.
- **SEV-2:** major feature unavailable, uploads failing, email delivery failing, or elevated error rate.
- **SEV-3:** isolated user issue or degraded non-critical flow.

## First 15 minutes

1. Name an incident lead and start a timestamped log.
2. Preserve logs and database evidence; do not delete suspicious records.
3. Contain: revoke sessions, rotate secrets, or roll back the application image.
4. Check `docker compose logs api` (JSON), container restarts, disk for uploads, SMTP errors, and recent deploys.
5. Post a user-facing status update for SEV-1/2.

## Security events

- Rotate JWT, database, SMTP, CI, and host credentials for the exposed boundary.
- Rotating `JWT_SECRET` logs out every user. Individual rows can be revoked in `Session`.
- Suspend abusive profiles instead of deleting evidence.
- Export relevant `ModerationAudit` rows and container logs.
- Legal owner decides notification obligations.

## Recovery

Restore service in stages, validate register → 5 works → publish → catalog → report, then close containment. Within 72 hours, write an internal postmortem.
